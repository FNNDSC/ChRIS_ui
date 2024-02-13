/**
 * This module contains type definitions of models which mostly mirror those of
 * [niivue-react](https://github.com/niivue/niivue-react/blob/9128a704fc912281caf574e13897851f3471821b/src/model.ts#L70),
 * but with non-optional keys.
 */

import { NVROptions, NVRVolume } from "niivue-react/src/model.ts";

/**
 * Subset of `NVROptions` with non-optional keys.
 */
type ChNVROptions = Required<
  Pick<
    NVROptions,
    | "isColorbar"
    | "isOrientCube"
    | "isHighResolutionCapable"
    | "sliceType"
    | "dragMode"
    | "isSliceMM"
    | "backColor"
    | "multiplanarForceRender"
    | "isRadiologicalConvention"
    | "show3Dcrosshair"
    | "crosshairWidth"
  >
>;

/**
 * Niivue options for volumes which can be customized in the Visual Dataset Browser.
 *
 * This is a subset of the options supported by pl-visual-dataset, meaning some
 * configurations such as `trustCalMinCalMax` are ignored.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.1.0/visualdataset/options.py#L9-L22
 */
type VolumeSettings = Pick<
  NVRVolume,
  "opacity" | "colormap" | "cal_min" | "cal_max" | "colorbarVisible"
>;

/**
 * A subset of `NVRVolume` with non-optional keys.
 */
type ChNVRVolume = { url: string } & Required<VolumeSettings>;

/**
 * A volume's state and its original default options.
 */
type DatasetVolume = {
  state: ChNVRVolume;
  default: VolumeSettings;
};

export type { VolumeSettings, ChNVRVolume, ChNVROptions, DatasetVolume };
