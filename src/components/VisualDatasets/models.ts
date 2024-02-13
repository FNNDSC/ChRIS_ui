/**
 * This module contains type definitions of models which mostly mirror those of
 * [niivue-react](https://github.com/niivue/niivue-react/blob/9128a704fc912281caf574e13897851f3471821b/src/model.ts#L70),
 * but with non-optional keys.
 */

import { FilebrowserFile } from "../../api/types.ts";
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
 */
type VolumeSettings = Pick<
  NVRVolume,
  | "opacity"
  | "colormap"
  | "cal_min" // contrast can be increased by increasing cal_min
  // cal_max is not listed here because changing it is usually pointless
  | "colorbarVisible"
>;

/**
 * A subset of `NVRVolume` with non-optional keys.
 */
type ChNVRVolume = { url: string } & Required<VolumeSettings>;

/**
 * Data associated with a file from a visual dataset.
 */
type VisualDatasetFile = {
  file: FilebrowserFile;
  defaultSettings: Required<VolumeSettings>;
  currentSettings: ChNVRVolume;

  // metadata provided by a sidecar file.
  // spec: https://github.com/FNNDSC/pl-visual-dataset/blob/8fdf598a84bba05511dd7aeab8a711f6098e83df/pubchrisvisual/types.py#L27-L50
  name: string | null;
  author: string | null;
  description: string | null;
  citation: string[];
  website: string | null;
};

/**
 * Contents of a `.chrisvisualdataset.volume.json` created by pl-visual-dataset.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/8fdf598a84bba05511dd7aeab8a711f6098e83df/pubchrisvisual/types.py#L27-L50
 */
type Sidecar = {
  name?: string;
  author?: string;
  description?: string;
  citation?: string[];
  website?: string;
  niivue_defaults?: VolumeSettings;
};

export type {
  VolumeSettings,
  ChNVRVolume,
  ChNVROptions,
  FilebrowserFile,
  VisualDatasetFile,
  Sidecar,
};
