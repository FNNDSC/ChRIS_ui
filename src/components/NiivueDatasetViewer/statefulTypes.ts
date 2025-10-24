import type { DatasetFile } from "./client";
import type {
  ChNVRVolume,
  SupportedVolumeSettings,
  VolumeSettings,
} from "./models";

/**
 * A volume's state and its original default options.
 */
type DatasetVolume = {
  state: ChNVRVolume;
  default: VolumeSettings & Pick<SupportedVolumeSettings, "colormapLabelFile">;
};

/**
 * Dataset file state.
 */
type DatasetFileState = {
  /**
   * Dataset file object.
   */
  file: DatasetFile;
  /**
   * State of the volume.
   *
   * - `null`: the volume is not loaded.
   * - `"pleaseLoadMe"`: volume should be loaded.
   * - `"loading"`: the volume is being loaded asynchronously.
   * - `DatasetVolume`: the volume is loaded.
   */
  volume: null | "pleaseLoadMe" | "loading" | DatasetVolume;
};

function volumeIsLoaded(
  fileState: DatasetFileState,
): fileState is Pick<DatasetFileState, "file"> & { volume: DatasetVolume } {
  return volumeIsVolume(fileState.volume);
}

function volumeIsVolume(
  volume: DatasetFileState["volume"],
): volume is DatasetVolume {
  return volume !== null && typeof volume !== "string";
}

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
export { files2states, volumeIsLoaded };
