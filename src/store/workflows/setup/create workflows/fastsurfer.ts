import { PluginInstance } from "@fnndsc/chrisapi";
import { PluginList } from "../../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { setYieldAnalysis } from "../../saga";

export function* runFastsurferWorkflow(
  dircopy: PluginInstance,
  pluginList: PluginList
) {
  const client = ChrisAPIClient.getClient();

  const pfdicomTagExtractArgsRoot = {
    title: "pre-tag-extract",
    previous_id: dircopy.data.id,
    ouputFileType: "txt,scv,json,html",
    outputFileStem: "Pre-Sub",
    imageFile: "'m:%_nospc|-_ProtocolName.jpg'",
    imageScale: "3:none",
  };
  const pfdicomTagExtract = pluginList["pl-pfdicom_tagextract"];

  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsRoot
  );

  const pfdicomTagSubArgs = {
    title: "sub-tags",
    previous_id: dircopy.data.id,
    extension: ".dcm",
    splitToken: "++",
    tagInfo:
      "'PatientName:%_name|patientID_PatientName ++ PatientID:%_md5|7_PatientID ++ PatientID:%_md5|7_PatientID ++ AccessionNumber:%_md5|8_AccessionNumber ++ PatientBirthDate:%_strmsk|******01_PatientBirthDate ++ re:.*hysician:%_md5|4_#tag ++ re:.*stitution:#tag ++ re:.*stitution:#tag'",
  };
  const pfdicomTagSub = pluginList["pl-pfdicom_tagsub"];
  const pfdicomTagSubInstance: PluginInstance =
    yield client.createPluginInstance(pfdicomTagSub.data.id, pfdicomTagSubArgs);

  const pfdicomTagExtractArgsTwo = {
    title: "post-tag-extract",
    previous_id: pfdicomTagSubInstance.data.id,
    ouputFileType: "txt,scv,json,html",
    outputFileStem: "Post-Sub",
    imageFile: "'m:%_nospc|-_ProtocolName.jpg'",
    imageScale: "3:none",
  };
  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsTwo
  );

  const plFshack = pluginList["pl-fshack"];
  const plFshackArgs = {
    title: "dicom-mgz",
    previous_id: pfdicomTagSubInstance.data.id,
    exec: "recon-all",
    args: "'ARGS: -autorecon1'",
    outputFile: "recon-of-SAG-anon-dcm",
    inputFile: ".dcm",
  };
  const plFshackInstance: PluginInstance = yield client.createPluginInstance(
    plFshack.data.id,
    plFshackArgs
  );
  const plFastsurfer = pluginList["pl-fastsurfer_inference"];
  const plFastsurferArgs = {
    title: "cnn",
    previous_id: plFshackInstance.data.id,
    subjectDir: "recon-of-SAG-anon-dcm",
    subject: "mri",
    copyInputFiles: "mgz",
    iname: "brainmask.mgz",
  };
  const plFastsurferInstance: PluginInstance =
    yield client.createPluginInstance(plFastsurfer.data.id, plFastsurferArgs);

  const plMultipass = pluginList["pl-multipass"];
  const plMultipassArgs = {
    title: "mgz-slices",
    previous_id: plFastsurferInstance.data.id,
    splitExpr: "++",
    commonArgs:
      "'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png'",
    specificArgs:
      "'--inputFile mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile mri/aparc.DKTatlas+aseg.deep.mgz --wholeVolume segVolume --lookupTable __fs__'",
    exec: "pfdo_mgz2image",
  };
  const plMultipassInstance: PluginInstance = yield client.createPluginInstance(
    plMultipass.data.id,
    plMultipassArgs
  );

  const plPfdoRun = pluginList["pl-pfdorun"];
  const plPfdoRunArgs = {
    title: "overlay-png",
    previous_id: plMultipassInstance.data.id,
    dirFilter: "label-brainVolume",
    fileFilter: "png",
    verbose: 5,
    exec: "'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aparc.DKTatlas+aseg.deep.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile'",
  };
  yield client.createPluginInstance(plPfdoRun.data.id, plPfdoRunArgs);

  const plMgz2LutReport = pluginList["pl-mgz2lut_report"];
  const plMgz2LutReportArgs = {
    title: "aseg-report",
    previous_id: plFastsurferInstance.data.id,
    file_name: "'mri/aparc.DKTatlas+aseg.deep.mgz",
    report_types: "txt,csv,json,html",
  };
  yield client.createPluginInstance(
    plMgz2LutReport.data.id,
    plMgz2LutReportArgs
  );
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
