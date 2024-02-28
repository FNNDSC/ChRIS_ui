import { DatasetFile } from "./client";
import { ChNVRVolume, SupportedVolumeSettings, VolumeSettings } from "./models";

/**
 * A volume's state and its original default options.
 */
type DatasetVolume = {
  state: ChNVRVolume;
  default: VolumeSettings & Pick<SupportedVolumeSettings, "colormapLabelFile">;
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
