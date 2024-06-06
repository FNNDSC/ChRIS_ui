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
    | "sagittalNoseLeft"
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
type SupportedVolumeSettings = Pick<
  NVRVolume,
  "opacity" | "colormap" | "cal_min" | "cal_max" | "colorbarVisible"
> & {
  /**
   * Name of a file which contains the data to use for `colormapLabel`.
   */
  colormapLabelFile?: string;
};

/**
 * Required {@link SupportedVolumeSettings} without `cal_max` and `colormapLabel`.
 *
 * It is safe to use some default value for the properties of
 * `UsualVolumeSettings`.
 *
 * - `cal_max` is excluded because a default value for `cal_max` will make most
 *   volumes look off.
 * - `colormapLabelFile` is excluded because it's complicated.
 */
type UsualVolumeSettings = Required<
  Omit<SupportedVolumeSettings, "cal_max" | "colormapLabelFile">
>;

/**
 * Same as {@link SupportedVolumeSettings} but with some fields required.
 */
type PreVolumeSettings = SupportedVolumeSettings & UsualVolumeSettings;

/**
 * Settings of a volume and its URL, but with `colormapLabelFile` instead of `colormapLabel`.
 *
 * Same as {@link PreVolumeSettings} but with `url`.
 */
type PreChNVRVolume = PreVolumeSettings & { url: string };

/**
 * Settings of a volume.
 *
 * Same as {@link PreVolumeSettings} but with `colormapLabel` instead of `colormapLabelFile`.
 */
type VolumeSettings = Omit<PreVolumeSettings, "colormapLabelFile"> &
  Pick<NVRVolume, "colormapLabel">;

/**
 * A subset of `NVRVolume` with (mostly) non-optional keys.
 */
type ChNVRVolume = { url: string } & VolumeSettings;

export type {
  SupportedVolumeSettings,
  UsualVolumeSettings,
  VolumeSettings,
  PreVolumeSettings,
  PreChNVRVolume,
  ChNVRVolume,
  ChNVROptions,
};
