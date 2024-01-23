/**
 * This module contains type definitions of models which mostly mirror those of
 * [niivue-react](https://github.com/niivue/niivue-react/blob/9128a704fc912281caf574e13897851f3471821b/src/model.ts#L70),
 * but with non-optional keys.
 */

import { SLICE_TYPE } from "@niivue/niivue";

/**
 * Mostly the same thing as `NVROptions` but with non-optional keys.
 */
type ChNVROptions = {
  isColorbar: boolean,
  isOrientCube: boolean,
  isHighResolutionCapable: boolean,
  sliceType: SLICE_TYPE,
  isSliceMM: boolean,
  backColor: number[],
  multiplanarForceRender: boolean,
  isRadiologicalConvention: boolean
};

/**
 * A subset of `NVRVolume` but with non-optional keys.
 */
type ChNVRVolume = {
  url: string,
  opacity: number,
  colormap: string,
  cal_min: number,
  cal_max: number,
  colorbarVisible: boolean
};

/**
 * Volume name and Niivue volume options.
 */
type VolumeEntry = {
  name: string,
  volume: ChNVRVolume
};

export type { VolumeEntry, ChNVRVolume, ChNVROptions };
