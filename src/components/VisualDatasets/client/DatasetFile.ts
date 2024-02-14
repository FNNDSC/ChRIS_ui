import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import { sequenceT } from "fp-ts/Apply";
import { findFirst } from "fp-ts/ReadonlyArray";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import {
  ChrisViewerFileOptions,
  DatasetFileMetadata,
  TagSet,
  VisualDatasetFileInfo,
} from "./models.ts";
import { Problem } from "../types.ts";
import problems from "./problems.tsx";
import { DatasetVolume, SupportedVolumeSettings } from "../models.ts";
import { produce } from "immer";
import { Option, none, some, match } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { parse as parseJson } from "fp-ts/Json";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";
import constants from "./constants.ts";
import { DEFAULT_VOLUME } from "../defaults.ts";

/**
 * A file from a visual dataset.
 */
class DatasetFile {
  private readonly client: FpClient;
  private readonly info: VisualDatasetFileInfo;
  private readonly options: ChrisViewerFileOptions;
  private readonly dataRoot: string;
  private readonly indexRoot: string;

  constructor(
    client: FpClient,
    info: VisualDatasetFileInfo,
    options: ChrisViewerFileOptions,
    dataRoot: string,
    indexRoot: string,
  ) {
    this.client = client;
    this.info = info;
    this.options = options;
    this.dataRoot = dataRoot;
    this.indexRoot = indexRoot;
  }

  /**
   * Get the volume state and its default options.
   */
  public getVolume(): TE.TaskEither<
    Problem,
    { problems: Problem[]; volume: DatasetVolume }
  > {
    return pipe(
      // get the volume file's URL and its sidecar data
      sequenceT(T.ApplyPar)(this.getFileResource(), this.getSidecar()),
      T.map(([fileResourceEither, sidecarEither]) =>
        pipe(
          fileResourceEither,
          E.map((fileResource) => {
            // if the sidecar cannot be obtained, that's ok, just use empty
            // defaults and produce a warning.
            const [sidecar, problems] = useSidecarOrGiveWarning(
              sidecarEither,
              this.info.path,
            );
            const defaultSettings = { ...DEFAULT_VOLUME, ...sidecar };
            const state = { ...defaultSettings, url: fileResource };
            return {
              problems,
              volume: {
                state,
                default: defaultSettings,
              },
            };
          }),
        ),
      ),
    );
  }

  /**
   * Get the `file_resource` URL of this file, which is the CUBE API URL
   * for downloading the file.
   */
  private getFileResource(): TE.TaskEither<Problem, string> {
    return pipe(
      this.getSingleFile(this.filePath),
      TE.map((file) => file.file_resource),
    );
  }

  /**
   * Get the sidecar data.
   */
  private getSidecar(): TE.TaskEither<string, SupportedVolumeSettings> {
    return pipe(
      this.sidecarPath,
      match(
        // if file does not have a sidecar, return empty
        () => TE.of({}),
        (path) =>
          pipe(
            // get the sidecar file data
            this.getSingleFile(path),
            TE.mapLeft(() => "could not get file"),
            TE.flatMap((file) =>
              pipe(
                file.getAsText(),
                TE.mapLeft(() => "could not download file"),
              ),
            ),
            TE.flatMap((textData) =>
              pipe(
                parseJson(textData),
                TE.fromEither,
                TE.mapLeft(() => "invalid json"),
                TE.map((data) => data as SupportedVolumeSettings),
              ),
            ),
          ),
      ),
    );
  }

  /**
   * Get the file resource object of a single file using the CUBE filebrowser API.
   */
  private getSingleFile(
    fname: string,
  ): TE.TaskEither<Problem, FpFileBrowserFile> {
    const [dirname, basename] = unsafeSplitPath(this.filePath);
    return pipe(
      this.client.getFewFilesUnder(dirname),
      TE.mapLeft(() => problems.failedRequestForFile(fname)),
      TE.flatMap((firstFewFiles) =>
        pipe(
          firstFewFiles,
          findFirst((file) => file.fname === fname),
          match(
            () => TE.left(problems.fileNotFound(dirname, basename)),
            (file) => TE.of(file),
          ),
        ),
      ),
    );
  }

  private get filePath(): string {
    return `${this.dataRoot}/${this.path}`;
  }

  private get sidecarPath(): Option<string> {
    if (this.info.has_sidecar) {
      return some(
        `${this.indexRoot}/${this.path}${constants.VOLUME_SIDECAR_EXTENSION}`,
      );
    }
    return none;
  }

  get path(): string {
    return this.info.path;
  }

  get metadata(): DatasetFileMetadata {
    return produce(this.options, (draft) => {
      delete draft.niivue_defaults;
    });
  }

  get tags(): TagSet {
    return this.info.tags;
  }
}

/**
 * Produce the directory name and file name of a path to a file.
 */
function unsafeSplitPath(path: string): [string, string] {
  const index = path.lastIndexOf("/");
  return [path.substring(0, index), path.substring(index)];
}

function useSidecarOrGiveWarning(
  e: E.Either<string, SupportedVolumeSettings>,
  path: string,
): [SupportedVolumeSettings, Problem[]] {
  return pipe(
    e,
    E.match(
      (errorMsg) => [{}, [problems.invalidSidecar(path, errorMsg)]],
      (sidecar) => [sidecar, []],
    ),
  );
}

export default DatasetFile;
