import { SupportedVolumeSettings } from "../models.ts";

/**
 * Description of a dataset file.
 */
type DatasetFileMetadata = {
  name?: string;
  author?: string;
  description?: string;
  citation?: string[];
  website?: string;
};

/**
 * Options of a visual dataset file.
 *
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.1.0/visualdataset/options.py#L27-L54
 */
type ChrisViewerFileOptions = DatasetFileMetadata & {
  niivue_defaults?: SupportedVolumeSettings;
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
 * https://github.com/FNNDSC/pl-visual-dataset/blob/v0.2.0/visualdataset/manifest.py#L36-L55
 */
type Manifest = {
  tags: { [key: string]: string[] };
  files: VisualDatasetFileInfo[];
  options: OptionsLink[];
  first_run_files: number[];
};

export type {
  Manifest,
  VisualDatasetFileInfo,
  OptionsLink,
  TagSet,
  ChrisViewerFileOptions,
  DatasetFileMetadata,
};
