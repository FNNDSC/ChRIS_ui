import {
  PluginInstance,
  PluginInstanceFileList,
  PluginInstanceList,
  Plugin,
  Feed,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import {
  RegistrationCheck,
  PluginList,
  DircopyData,
  FeedReturnPayload,
  PollStatus,
  Med2ImgData,
  CovidnetData,
  IFSHackData,
} from "./workflows/types";
import { LocalFile } from "../components/feed/CreateFeed/types";
import { v4 } from "uuid";
import GalleryModel from "../api/models/gallery.model";
import { setYieldAnalysis } from "./workflows/saga";

import { IActionTypeParam } from "../api/models/base.model";

export function* getPluginFiles(plugin: PluginInstance) {
  const params = { limit: 200, offset: 0 };
  let fileList: PluginInstanceFileList = yield plugin.getFiles(params);
  let files = fileList.getItems();

  while (fileList.hasNextPage) {
    try {
      params.offset += params.limit;
      fileList = yield plugin.getFiles(params);
      files = files.concat(fileList.getItems());
    } catch (e) {
      throw new Error("Error while paginating files");
    }
  }
  return files;
}

export function* getPlugin(pluginName: string) {
  const client = ChrisAPIClient.getClient();
  const pluginLookup: PluginInstanceList = yield client.getPlugins({
    name_exact: pluginName,
  });
  const plugin: Plugin = yield pluginLookup.getItems()[0];
  return plugin;
}

function* uploadLocalFiles(files: LocalFile[], directory: string) {
  const client = ChrisAPIClient.getClient();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    yield client.uploadFile(
      {
        upload_path: `${directory}/${file.name}`,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
  }
}

function uploadedFilePaths(files: LocalFile[], directory: string) {
  let localFilePath = "";
  if (files.length > 1) {
    localFilePath = directory;
  } else localFilePath = `${directory}/`;
  return localFilePath;
}

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
  const filePaths = uploadedFilePaths(localFiles, directoryName);
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

export function* runCovidnetWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();
  const files: any[] = yield getPluginFiles(dircopy);
  for (let i = 0; i < files.length; i++) {
    const inputFile = files[i].data.fname.split("/").pop();
    if (GalleryModel.isValidDcmFile(inputFile)) {
      const filename = inputFile.split(".")[0];
      const imgData: Med2ImgData = {
        inputFile,
        sliceToConvert: 0,
        previous_id: dircopy.data.id,
        outputFileStem: `${filename}.jpg`,
      };
      const med2img = pluginList["pl-med2img"];
      const med2imgInstance: PluginInstance = yield client.createPluginInstance(
        med2img.data.id,
        imgData
      );
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
  }
}

export function* setupCovidnet(action: IActionTypeParam) {
  const { localFiles, username } = action.payload;
  const covidnetPlugins: string[] = [
    "pl-dircopy",
    "pl-med2img",
    "pl-covidnet",
    "pl-pdfgeneration",
  ];
  yield setYieldAnalysis(2, "Creating a Feed", "process", "");
  const { feedPayload, plugins } = yield createFeed(
    covidnetPlugins,
    localFiles,
    username
  );
  const { feed, instance, error } = feedPayload;

  if (feed) {
    yield setYieldAnalysis(2, "Feed Created", "finish", "");
    if (instance) {
      yield setYieldAnalysis(3, "Scheduling jobs", "finish", "");
      const result: string = yield pollingBackend(instance);
      if (result === "finishedSuccessfully") {
        yield runCovidnetWorkflow(instance, plugins);
      }

      yield setYieldAnalysis(4, "Finished Scheduling", "finish", "");
    }
  } else {
    yield setYieldAnalysis(2, "Cannot Create a Feed", "error", `${error}`);
  }
}

export function* setupAdultFreesurfer(action: IActionTypeParam) {
  const { localFiles, username } = action.payload;
  const adultFreesurferPlugins: string[] = [
    "pl-dircopy",
    "pl-pfdicom_tagsub",
    "pl-pfdicom_tagextract",
    "pl-fshack",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2lut_report",
  ];
  yield setYieldAnalysis(2, "Creating a Feed", "process", "");
  const { feedPayload, plugins } = yield createFeed(
    adultFreesurferPlugins,
    localFiles,
    username
  );
  const { feed, instance, error } = feedPayload;
  if (feed) {
    yield setYieldAnalysis(2, "Feed Created", "finish", "");
    yield setYieldAnalysis(3, "Scheduling Jobs", "process", "");
    yield runFastSurferWorkflow(instance, plugins);
  }
  if (error) {
    yield setYieldAnalysis(
      2,
      "Error While Creating a Feed",
      "error",
      `${error}`
    );
  }
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
    extension: ".dcm",
    previous_id: dircopy.data.id,
    title: "sub-tags",
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
    outputFile: "recon-all",
    args: "' -all -notalairach '",
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
    previous_id: plMultipassInstance.data.id,
    report_types: "txt,csv,json,html",
  };
  yield client.createPluginInstance(
    plMgz2LutReport.data.id,
    plMgz2LutReportArgs
  );

  yield setYieldAnalysis(3, "Scheduled Successfully", "finish", "");
}
