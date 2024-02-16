import { DatasetFile } from "./client";
import { ChNVRVolume, VolumeSettings } from "./models.ts";

/**
 * A volume's state and its original default options.
 */
type DatasetVolume = {
  state: ChNVRVolume;
  default: VolumeSettings;
};

type DatasetFileState = {
  file: DatasetFile;
  volume: null | "loading" | DatasetVolume;
};

/**
 * Convert file objects to state objects with no volumes.
 */
function files2states(
  files: ReadonlyArray<DatasetFile>,
): ReadonlyArray<DatasetFileState> {
  return files.map((file) => {
    return { file, volume: null };
  });
}

export type { DatasetVolume, DatasetFileState };
export { files2states };
