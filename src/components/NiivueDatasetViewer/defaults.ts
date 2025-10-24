import { DRAG_MODE, SLICE_TYPE } from "@niivue/niivue";
import type { ChNVROptions, UsualVolumeSettings } from "./models.ts";

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
  sagittalNoseLeft: true,
  show3Dcrosshair: true,
  crosshairWidth: 0.5,
};

const DEFAULT_VOLUME: UsualVolumeSettings = {
  opacity: 1.0,
  colormap: "gray",
  cal_min: 0,
  colorbarVisible: false,
};

export { DEFAULT_OPTIONS, DEFAULT_VOLUME };
