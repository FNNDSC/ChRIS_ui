import { ChNVROptions } from "./models.ts";
import { SLICE_TYPE } from "@niivue/niivue";

const DEFAULT_OPTIONS: ChNVROptions = {
  isColorbar: true,
  isOrientCube: true,
  isHighResolutionCapable: true,
  sliceType: SLICE_TYPE.MULTIPLANAR,
  isSliceMM: true,
  backColor: [0, 0, 0],
  multiplanarForceRender: true,
  isRadiologicalConvention: true
};

export {DEFAULT_OPTIONS};
