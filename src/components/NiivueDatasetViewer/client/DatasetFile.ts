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
} from "./models";
import { constants } from "../../../datasets";
import PROBLEMS from "./problems";
import {
  ChNVRVolume,
  PreChNVRVolume,
  SupportedVolumeSettings,
} from "../models";
import { ColorMap } from "niivue-react/src/reexport";
import { Option, none, some, match } from "fp-ts/Option";
import { pipe, flow } from "fp-ts/function";
import { parse as parseJson } from "fp-ts/Json";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile";
import { DEFAULT_VOLUME } from "../defaults";
import { Problem } from "../types.ts";
import { right } from "fp-ts/Either";

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
   * Get the default volume state of this file.
   */
  public getVolume(): TE.TaskEither<
    Problem,
    { problems: Problem[]; volume: ChNVRVolume }
  > {
    return pipe(
      // get the volume file's URL and its sidecar data
      sequenceT(T.ApplyPar)(this.getFileResource(), this.getSidecar()),
      // must have file_resource, sidecar is optional and may fail
      T.map(mustHaveFileResource),
      TE.map(([fileResource, sidecarEither]) => {
        // if the sidecar cannot be obtained, that's ok, just use empty
        // defaults and produce a warning.
        const [sidecar, problems] = useSidecarOrGiveWarning(
          sidecarEither,
          this.info.path,
        );
        const volume: PreChNVRVolume = {
          ...DEFAULT_VOLUME,
          ...this.options.niivue_defaults,
          ...sidecar,
          url: fileResource,
        };
        return { problems, volume };
      }),
      // for label volumes, get colormapLabelFile
      TE.flatMap(({ problems, volume }) => {
        if (volume.colormapLabelFile === undefined) {
          return TE.fromEither(right({ problems, volume }));
        }
        return TE.fromTask(
          this.getColormapLabelFile(
            { problems, volume },
            volume.colormapLabelFile,
          ),
        );
      }),
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

  private getColormapLabelFile(
    { problems, volume }: { problems: Problem[]; volume: PreChNVRVolume },
    colormapLabelFile: string,
  ): T.Task<{ problems: Problem[]; volume: ChNVRVolume }> {
    return pipe(
      this.getSingleFile(`${this.indexRoot}/${colormapLabelFile}`),
      TE.flatMap((data) => data.getAsText()),
      TE.flatMap(flow(parseJson, TE.fromEither)),
      TE.map((data) => data as ColorMap),
      TE.match(
        // I wonder what _error's type is?
        (_error) => {
          const problem = PROBLEMS.couldNotGetColormaplabel(colormapLabelFile);
          return {
            problems: problems.concat([problem]),
            volume,
          };
        },
        (colormapLabel) => {
          return {
            problems,
            volume: {
              ...volume,
              colormapLabel,
            },
          };
        },
      ),
    );
  }

  /**
   * Get the file resource object of a single file using the CUBE filebrowser API.
   */
  private getSingleFile(
    fname: string,
  ): TE.TaskEither<Problem, FpFileBrowserFile> {
    const [dirname, basename] = unsafeSplitPath(fname);
    return pipe(
      this.client.getFewFilesUnder(dirname),
      TE.mapLeft(() => PROBLEMS.failedRequestForFile(fname)),
      TE.flatMap((firstFewFiles) =>
        pipe(
          firstFewFiles,
          findFirst((file) => file.fname === fname),
          match(
            () => TE.left(PROBLEMS.fileNotFound(dirname, basename)),
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
    const { niivue_defaults: _, ...rest } = this.options;
    return rest;
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
      (errorMsg) => [{}, [PROBLEMS.invalidSidecar(path, errorMsg)]],
      (sidecar) => [sidecar, []],
    ),
  );
}

function mustHaveFileResource<A, B, C, D>([fileResource, sidecar]: [
  E.Either<A, B>,
  E.Either<C, D>,
]): E.Either<A, [B, E.Either<C, D>]> {
  return pipe(
    fileResource,
    E.map((fileResource) => [fileResource, sidecar]),
  );
}

export { DatasetFile };
