import { PluginInstance } from "@fnndsc/chrisapi";
import { PluginList } from "../../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { setYieldAnalysis } from "../../saga";

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
    pluginList["pl-ANTs_N4BiasFieldCorrection"];
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
