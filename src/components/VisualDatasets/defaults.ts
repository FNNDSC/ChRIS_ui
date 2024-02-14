import { ChNVROptions, UsualVolumeSettings } from "./models.ts";
import { DRAG_MODE, SLICE_TYPE } from "@niivue/niivue";

const DEFAULT_OPTIONS: ChNVROptions = {
  isColorbar: true,
  isOrientCube: true,
  isHighResolutionCapable: true,
  sliceType: SLICE_TYPE.MULTIPLANAR,
  dragMode: DRAG_MODE.measurement,
  isSliceMM: true,
  backColor: [0, 0, 0],
  multiplanarForceRender: false,
  isRadiologicalConvention: true,
  show3Dcrosshair: true,
  crosshairWidth: 1,
};

const DEFAULT_VOLUME: UsualVolumeSettings = {
  opacity: 0.0,
  colormap: "gray",
  cal_min: 0,
  colorbarVisible: false,
};

export { DEFAULT_OPTIONS, DEFAULT_VOLUME };
