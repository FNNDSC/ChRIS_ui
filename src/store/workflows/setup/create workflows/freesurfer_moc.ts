import { PluginInstance } from "@fnndsc/chrisapi";
import { AFSHackData, PluginList } from "../../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { setYieldAnalysis } from "../../saga";
export function* runFreesurferMocWorkflow(
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
    extension: ".dcm",
  };
  const pfdicomTagExtract = pluginList["pl-pfdicom_tagextract_ghcr"];
  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsRoot
  );
  const pfdicomTagSubArgs = {
    title: "anonymized-dicoms",
    previous_id: dircopy.data.id,
    extension: ".dcm",
    splitToken: "++",
    splitKeyValue: ",",
    tagInfo:
      "'PatientName,%_name|patientID_PatientName ++ PatientID,%_md5|7_PatientID ++ AccessionNumber,%_md5|8_AccessionNumber ++ PatientBirthDate,%_strmsk|******01_PatientBirthDate ++ re:.*hysician,%_md5|4_#tag ++ re:.*stitution,#tag ++ re:.*ddress,#tag'",
  };
  const pfdicomTagSub = pluginList["pl-pfdicom_tagsub_ghcr"];
  const pfdicomTagSubInstance: PluginInstance =
    yield client.createPluginInstance(pfdicomTagSub.data.id, pfdicomTagSubArgs);
  const pfdicomTagExtractArgsTwo = {
    title: "post-tag-extract",
    previous_id: pfdicomTagSubInstance.data.id,
    ouputFileType: "txt,scv,json,html",
    outputFileStem: "Post-Sub",
    imageFile: "'m:%_nospc|-_ProtocolName.jpg'",
    imageScale: "3:none",
    extension: ".dcm",
  };
  yield client.createPluginInstance(
    pfdicomTagExtract.data.id,
    pfdicomTagExtractArgsTwo
  );

  const plFsHackArgs: AFSHackData = {
    title: "adult-fs",
    previous_id: pfdicomTagSubInstance.data.id,
    inputFile: ".dcm",
    exec: "recon-all",
    outputFile: "recon-of-SAG-anon-dcm",
    args: "'ARGS: -all'",
  };
  const plFsHack = pluginList["pl-fshack_ghcr:1.0.0"];
  const plFsHackInstance: PluginInstance = yield client.createPluginInstance(
    plFsHack.data.id,
    plFsHackArgs
  );
  const plMultipass = pluginList["pl-multipass_ghcr"];
  const plMultipassArgs = {
    title: "png-images",
    previous_id: plFsHackInstance.data.id,
    splitExpr: "++",
    commonArgs:
      "'--printElapsedTime --verbosity 5 --saveImages --skipAllLabels --outputFileStem sample --outputFileType png'",
    specificArgs:
      "'--inputFile recon-of-SAG-anon-dcm/mri/brainmask.mgz --wholeVolume brainVolume ++ --inputFile recon-of-SAG-anon-dcm/mri/aparc.a2009s+aseg.mgz --wholeVolume segVolume --lookupTable __fs__'",
    exec: "pfdo_mgz2image",
  };
  const plMultipassInstance: PluginInstance = yield client.createPluginInstance(
    plMultipass.data.id,
    plMultipassArgs
  );
  const plPfdoRun = pluginList["pl-pfdorun_ghcr"];
  const plPfdoRunArgs = {
    title: "overlay-png",
    previous_id: plMultipassInstance.data.id,
    dirFilter: "label-brainVolume",
    fileFilter: "png",
    verbose: 5,
    exec: "'composite -dissolve 90 -gravity Center %inputWorkingDir/%inputWorkingFile %inputWorkingDir/../../aparc.a2009s+aseg.mgz/label-segVolume/%inputWorkingFile -alpha Set %outputWorkingDir/%inputWorkingFile'",
  };
  yield client.createPluginInstance(plPfdoRun.data.id, plPfdoRunArgs);

  const plMgz2LutReport = pluginList["pl-mgz2LUT_report_ghcr_m3"];
  const plMgz2LutReportArgs = {
    title: "segmentation-report",
    previous_id: plFsHackInstance.data.id,
    file_name: "recon-of-SAG-anon-dcm/mri/aparc.a2009s+aseg.mgz",
    report_types: "txt,csv,json,html",
  };
  yield client.createPluginInstance(
    plMgz2LutReport.data.id,
    plMgz2LutReportArgs
  );
  yield setYieldAnalysis(3, "Created a Feed Tree", "finish", "");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
