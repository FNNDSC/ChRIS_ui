import GalleryModel from "../../../api/models/gallery.model";
import { Med2ImgData, CovidnetData, IFSHackData, PluginList } from "../types";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getPluginFiles } from "../../utils";
import { setYieldAnalysis } from "../saga";

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
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}

export function* runAdultFreesurferWorkflow(
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
      "'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png'",
    specificArgs:
      "'--inputFile recon-of-SAG-anon-dcm/mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile recon-of-SAG-anon-dcm/mri/aparc.a2009s+aseg.mgz --wholeVolume segVolume --lookupTable __fs__ '",
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
    exec: "'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aseg.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile'",
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
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}

export function* runFastsurferWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();
  const plFshack = pluginList["pl-fshack"];
  const plFshackArgs = {
    exec: "recon-all",
    args: "' ARGS: -autorecon1 '",
    outputFile: "recon-of-SAG-anon-nii",
    inputFile: ".dcm",
    previous_id: dircopy.data.id,
  };
  const plFshackInstance: PluginInstance = yield client.createPluginInstance(
    plFshack.data.id,
    plFshackArgs
  );
  const plFastsurfer = pluginList["pl-fastsurfer_inference"];
  const plFastsurferArgs = {
    search_tag: "recon-of-SAG-anon/mri",
    previous_id: plFshackInstance.data.id,
    cleanup: true,
    in_name: "brainmask.mgz",
  };
  const plFastsurferInstance: PluginInstance =
    yield client.createPluginInstance(plFastsurfer.data.id, plFastsurferArgs);

  const plMgz2LutReport = pluginList["pl-mgz2lut_report"];
  const plMgz2LutReportArgs = {
    previous_id: plFastsurferInstance.data.id,
  };
  yield client.createPluginInstance(
    plMgz2LutReport.data.id,
    plMgz2LutReportArgs
  );
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}

export function* runFetalReconstructionWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();
  const plFetalBrainMask = pluginList["pl-fetal-brain-mask"];

  const plFetalBrainMaskArgs = {
    previous_id: dircopy.data.id,
  };

  const plFetalBrainMaskInstance: PluginInstance =
    yield client.createPluginInstance(
      plFetalBrainMask.data.id,
      plFetalBrainMaskArgs
    );

  const plAntsN4BiasFieldCorrection =
    pluginList["pl-ants_n4biasfieldcorrection"];
  const plAntsN4BiasFieldCorrectionArgs = {
    previous_id: plFetalBrainMaskInstance.data.id,
    inputPathFilter: "extracted/0.0/*.nii",
  };
  const plAntsN4BiasFieldCorrectionInstance: PluginInstance =
    yield client.createPluginInstance(
      plAntsN4BiasFieldCorrection.data.id,
      plAntsN4BiasFieldCorrectionArgs
    );

  const plFetalBrainAssessment = pluginList["pl-fetal-brain-assessment"];
  const plFetailBrainAssessmentArgs = {
    previous_id: plAntsN4BiasFieldCorrectionInstance.data.id,
  };

  const plFetailBrainAssessmentInstance: PluginInstance =
    yield client.createPluginInstance(
      plFetalBrainAssessment.data.id,
      plFetailBrainAssessmentArgs
    );
  const plIrtkReconstruction = pluginList["pl-irtk-reconstruction"];
  const plIrtkReconstructionArgs = {
    previous_id: plFetailBrainAssessmentInstance.data.id,
    inputPathFilter: "Best_Images_crop/*.nii",
    csv: "quality_assessment.csv",
  };
  yield client.createPluginInstance(
    plIrtkReconstruction.data.id,
    plIrtkReconstructionArgs
  );
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
