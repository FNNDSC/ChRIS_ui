import { NVRVolume } from "niivue-react/src/model.ts";

/**
 * Options of NiiVue supported by pl-visual-dataset.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.1.0/visualdataset/options.py#L9-L22
 */
type NiivueVolumeSettings = Pick<
  NVRVolume,
  | "opacity"
  | "colormap"
  | "colormapNegative"
  | "cal_min"
  | "cal_max"
  | "trustCalMinMax"
  | "visible"
  | "colorbarVisible"
>;

/**
 * Options of a visual dataset file.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.1.0/visualdataset/options.py#L27-L54
 */
type ChrisViewerFileOptions = {
  name?: string;
  author?: string;
  description?: string;
  citation?: string[];
  website?: string;
  niivue_defaults?: NiivueVolumeSettings;
};

/**
 * A set of tags (key-value pairs).
 */
type TagSet = { [key: string]: string };

/**
 * Information about a file of a visual dataset.
 */
type VisualDatasetFileInfo = {
  path: string;
  tags: TagSet;
  has_sidecar: boolean;
};

type OptionsLink = {
  match: TagSet;
  options: ChrisViewerFileOptions;
};

/**
 * Schema of a manifest file.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.1.0/visualdataset/manifest.py#L36-L55
 */
type ManifestData = {
  tags: { [key: string]: string[] };
  files: VisualDatasetFileInfo[];
  options: OptionsLink[];
};

export type {
  ManifestData,
  VisualDatasetFileInfo,
  OptionsLink,
  TagSet,
  NiivueVolumeSettings,
};
