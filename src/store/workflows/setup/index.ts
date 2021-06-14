import {
  RegistrationCheck,
  PluginList,
  DircopyData,
  FeedReturnPayload,
  PollStatus,
  Med2ImgData,
  CovidnetData,
  IFSHackData,
} from "../types";
import { v4 } from "uuid";
import GalleryModel from "../../../api/models/gallery.model";
import { setYieldAnalysis } from "../saga";
import { IActionTypeParam } from "../../../api/models/base.model";
import { PluginInstance, Plugin, Feed } from "@fnndsc/chrisapi";
import { LocalFile } from "../../../components/feed/CreateFeed/types";
import ChrisAPIClient from "../../../api/chrisapiclient";
import {
  getPluginFiles,
  getPlugin,
  uploadLocalFiles,
  uploadFilePaths,
} from "../../utils";

export function* checkPluginRegistration(pluginList: string[]) {
  const pluginRegistry: RegistrationCheck = {
    checkPassed: true,
    plugins: {},
  };
  for (let i = 0; i < pluginList.length; i++) {
    const { plugins } = pluginRegistry;
    const pluginNeeded = pluginList[i];

    const pluginFetched: Plugin = yield getPlugin(pluginNeeded);
    if (!pluginFetched) {
      pluginRegistry["checkPassed"] = false;
    }
    plugins[pluginNeeded] = pluginFetched;
  }

  return pluginRegistry;
}

export function* pollingBackend(instance: PluginInstance) {
  //@ts-ignore
  const instanceDetails = yield instance.get();
  const timeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  yield timeout(1000);
  const shouldWait = () => {
    const returnValue = ![
      PollStatus.CANCELLED,
      PollStatus.ERROR,
      PollStatus.SUCCESS,
    ].includes(instanceDetails.data.status);
    return returnValue;
  };
  while (shouldWait()) {
    yield timeout(6000);
    yield instance.get();
  }
  const result = instanceDetails.data.status;
  if (
    [PollStatus.CANCELLED, PollStatus.ERROR].includes(
      instanceDetails.data.status
    )
  ) {
  } else return result;
}

export function* createFeedWithDircopy(
  pluginList: PluginList,
  localFiles: LocalFile[],
  username: string
) {
  const feedPayload: FeedReturnPayload = {
    feed: undefined,
    error: undefined,
    instance: undefined,
  };
  const client = ChrisAPIClient.getClient();
  const directoryName = `${username}/uploads/${v4()}`;
  yield uploadLocalFiles(localFiles, directoryName);
  const totalFilePaths: string[] = [];
  const filePaths = uploadFilePaths(localFiles, directoryName);
  totalFilePaths.push(filePaths);

  const data: DircopyData = {
    dir: totalFilePaths.join(","),
  };
  const dircopy = pluginList["pl-dircopy"];
  try {
    const dircopyInstance: PluginInstance = yield client.createPluginInstance(
      dircopy.data.id,
      data
    );
    const feed: Feed = yield dircopyInstance.getFeed();
    feedPayload["feed"] = feed;
    feedPayload["instance"] = dircopyInstance;
  } catch (error) {
    feedPayload["error"] = error;
  }

  return feedPayload;
}

export function* createFeed(
  pluginList: string[],
  localFiles: LocalFile[],
  username: string
) {
  yield setYieldAnalysis(1, "Plugins Registration Check", "process", "");
  const pluginRegistry: RegistrationCheck = yield checkPluginRegistration(
    pluginList
  );
  if (pluginRegistry.checkPassed) {
    yield setYieldAnalysis(1, "Registration Check Complete", "finish", "");
    const feedPayload: FeedReturnPayload = yield createFeedWithDircopy(
      pluginRegistry.plugins,
      localFiles,
      username
    );
    return {
      feedPayload,
      plugins: pluginRegistry.plugins,
    };
  } else {
    const errorCode = `Here are a list of plugins required ${pluginList.join(
      " , "
    )} `;
    setYieldAnalysis(1, "Registration Check Failed", "error", errorCode);
  }
}

export function* setupCovidnet(action: IActionTypeParam) {
  const covidnetPlugins: string[] = [
    "pl-dircopy",
    "pl-med2img",
    "pl-covidnet",
    "pl-pdfgeneration",
  ];
  yield setupFeedDetails(action, covidnetPlugins, "covidnet");
}

export function* setupInfantFreesurfer(action: IActionTypeParam) {
  const infantFreesurferPlugins = ["pl-dircopy", "pl-fshack-infant"];
  yield setupFeedDetails(action, infantFreesurferPlugins, "infant-freesurfer");
  yield setYieldAnalysis(4, "Finished Setup", "finish", "");
}

export function* setupAdultFreesurfer(action: IActionTypeParam) {
  const adultFreesurferPlugins: string[] = [
    "pl-dircopy",
    "pl-pfdicom_tagsub",
    "pl-pfdicom_tagextract",
    "pl-fshack",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2lut_report",
  ];
  yield setupFeedDetails(action, adultFreesurferPlugins, "adult-freesurfer");
}

export function* setupFeedDetails(
  action: IActionTypeParam,
  pluginNames: string[],
  workflowType: string
) {
  yield setYieldAnalysis(2, "Creating a Feed", "process", "");
  const { localFiles, username } = action.payload;
  const { feedPayload, plugins } = yield createFeed(
    pluginNames,
    localFiles,
    username
  );
  const { feed, instance, error } = feedPayload;

  if (feed) {
    yield setYieldAnalysis(2, "Feed Created", "finish", "");
    if (workflowType === "covidnet" || workflowType === "infant-freesurfer") {
      if (instance) {
        yield setYieldAnalysis(3, "Scheduling jobs", "process", "");
        const result: string = yield pollingBackend(instance);
        if (result === "finishedSuccessfully") {
          yield runGenericWorkflow(instance, plugins, workflowType);
        }
      }
    }
    if (workflowType === "adult-freesurfer") {
      yield setYieldAnalysis(3, "Scheduling jobs", "process", "");
      yield runFastSurferWorkflow(instance, plugins);
    }
    yield setYieldAnalysis(4, "Finished Scheduling", "finish", "");
  } else {
    yield setYieldAnalysis(2, "Cannot Run the Workflow", "error", `${error}`);
  }
}

export function* runGenericWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList,
  workflowType: string
) {
  const client = ChrisAPIClient.getClient();
  const files: any[] = yield getPluginFiles(dircopy);
  for (let i = 0; i < files.length; i++) {
    const inputFile = files[i].data.fname.split("/").pop();
    if (GalleryModel.isValidDcmFile(inputFile)) {
      if (workflowType === "covidnet") {
        const filename = inputFile.split(".")[0];
        const imgData: Med2ImgData = {
          inputFile,
          sliceToConvert: 0,
          previous_id: dircopy.data.id,
          outputFileStem: `${filename}.jpg`,
        };
        const med2img = pluginList["pl-med2img"];
        const med2imgInstance: PluginInstance =
          yield client.createPluginInstance(med2img.data.id, imgData);
        const covidnetData: CovidnetData = {
          previous_id: med2imgInstance.data.id,
          imagefile: `${filename}.jpg`,
        };
        const covidnet = pluginList["pl-covidnet"];
        const covidnetInstance: PluginInstance =
          yield client.createPluginInstance(covidnet.data.id, covidnetData);
        const pdfGeneration = pluginList["pl-pdfgeneration"];
        const pdfGenerationData = {
          previous_id: covidnetInstance.data.id,
          imagefile: `${filename}.jpg`,
        };
        yield client.createPluginInstance(
          pdfGeneration.data.id,
          pdfGenerationData
        );
      }
      if (workflowType === "infant-freesurfer") {
        const data: IFSHackData = {
          previous_id: dircopy.data.id,
          title: "InfantFS",
          inputFile,
          outputFile: "output",
          exec: "recon-all",
          args: "'{ -all}'",
        };
        const plFshackInfant = pluginList["pl-fshack-infant"];
        yield client.createPluginInstance(plFshackInfant.data.id, data);
      }
    }
  }
  yield setYieldAnalysis(3, "Scheduled Successfully", "finish", "");
}

export function* runFastSurferWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();

  const pfdicomTagExtractArgsRoot = {
    title: "tag-extract",
    previous_id: dircopy.data.id,
    ouputFileType: "txt,scv,json,html",
    outputFileStem: "Post-Sub",
  };
  const pfdicomTagExtract = pluginList["pl-pfdicom_tagextract"];

  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsRoot
  );

  const pfdicomTagSubArgs = {
    previous_id: dircopy.data.id,
    title: "sub-tags",
    extension: ".dcm",
    splitToken: "++",
    tagInfo:
      "'PatientName:%_name|patientID_PatientName ++ PatientID:%_md5|7_PatientID ++ PatientID:%_md5|7_PatientID ++ AccessionNumber:%_md5|8_AccessionNumber ++ PatientBirthDate:%_strmsk|******01_PatientBirthDate ++ re:.*hysician:%_md5|4_#tag ++ re:.*stitution:#tag ++ re:.*stitution:#tag'",
  };
  const pfdicomTagSub = pluginList["pl-pfdicom_tagsub"];
  const pfdicomTagSubInstance: PluginInstance =
    yield client.createPluginInstance(pfdicomTagSub.data.id, pfdicomTagSubArgs);

  const pfdicomTagExtractArgsTwo = {
    title: "tag-extract",
    previous_id: pfdicomTagSubInstance.data.id,
    ouputFileType: "txt,scv,json,html",
    outputFileStem: "Post-Sub",
  };
  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsTwo
  );

  const plFsHackArgs: IFSHackData = {
    previous_id: pfdicomTagSubInstance.data.id,
    title: "adult-fs",
    inputFile: ".dcm",
    exec: "recon-all",
    outputFile: "recon-of-SAG-anon-dcm",
    args: "' ARGS: -all '",
  };
  const plFsHack = pluginList["pl-fshack"];
  const plFsHackInstance: PluginInstance = yield client.createPluginInstance(
    plFsHack.data.id,
    plFsHackArgs
  );

  const plMultipass = pluginList["pl-multipass"];
  const plMultipassArgs = {
    splitExpr: "++",
    commonArgs:
      "\\'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png\\'",
    specificArgs:
      "\\'--inputFile recon-of-SAG-anon-dcm/mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile recon-of-SAG-anon-dcm/mri/aseg.mgz --wholeVolume segVolume --lookupTable __fs__ \\'",
    exec: "pfdo_mgz2img",
    title: "mgz-slices",
    previous_id: plFsHackInstance.data.id,
  };
  const plMultipassInstance: PluginInstance = yield client.createPluginInstance(
    plMultipass.data.id,
    plMultipassArgs
  );

  const plPfdoRun = pluginList["pl-pfdorun"];
  const plPfdoRunArgs = {
    dirFilter: "label-brainVolume",
    fileFilter: "png",
    verbose: 5,
    exec: "\\'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aseg.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile\\'",
    title: "overlay-png",
    previous_id: plMultipassInstance.data.id,
  };
  yield client.createPluginInstance(plPfdoRun.data.id, plPfdoRunArgs);

  const plMgz2LutReport = pluginList["pl-mgz2lut_report"];
  const plMgz2LutReportArgs = {
    title: "aseg-report",
    previous_id: plFsHackInstance.data.id,
    fileName: "recon-of-SAG-anon-dcm/mri/aseg.mgz",
    report_types: "txt,csv,json,html",
  };
  yield client.createPluginInstance(
    plMgz2LutReport.data.id,
    plMgz2LutReportArgs
  );
  yield setYieldAnalysis(3, "Scheduled Successfully", "finish", "");
}
