import { ChNVROptions } from "./models.ts";
import { DRAG_MODE, SLICE_TYPE } from "@niivue/niivue";

const DEFAULT_OPTIONS: ChNVROptions = {
  isColorbar: true,
  isOrientCube: true,
  isHighResolutionCapable: true,
  sliceType: SLICE_TYPE.MULTIPLANAR,
  dragMode: DRAG_MODE.measurement,
  isSliceMM: true,
  backColor: [0, 0, 0],
  multiplanarForceRender: true,
  isRadiologicalConvention: true,
  show3Dcrosshair: true,
  crosshairWidth: 1
};

export {DEFAULT_OPTIONS};
