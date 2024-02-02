/**
 * This module contains type definitions of models which mostly mirror those of
 * [niivue-react](https://github.com/niivue/niivue-react/blob/9128a704fc912281caf574e13897851f3471821b/src/model.ts#L70),
 * but with non-optional keys.
 */

import { NVROptions, NVRVolume } from "niivue-react/src/model.ts";

/**
 * Subset of `NVROptions` with non-optional keys.
 */
type ChNVROptions = Required<Pick<NVROptions,
  "isColorbar"
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
>>;

/**
 * A subset of `NVRVolume` with non-optional keys.
 */
type ChNVRVolume = Required<Pick<NVRVolume,
  "url"
  | "opacity"
  | "colormap"
  | "cal_min"
  | "cal_max"
  | "colorbarVisible"
>>;

/**
 * Volume name and Niivue volume options.
 */
type VolumeEntry = {
  name: string,
  volume: ChNVRVolume
};

export type { VolumeEntry, ChNVRVolume, ChNVROptions };
