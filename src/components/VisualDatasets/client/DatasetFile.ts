import * as TE from "fp-ts/TaskEither";
import { findFirstMap } from "fp-ts/ReadonlyArray";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import {
  ChrisViewerFileOptions,
  DatasetFileMetadata,
  TagSet,
  VisualDatasetFileInfo,
} from "./models.ts";
import { Problem } from "../types.ts";
import { DatasetVolume } from "../models.ts";
import { produce } from "immer";
import { Option, none, some } from "fp-ts/Option";
import { pipe } from "fp-ts/function";

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
  public getVolume(): TE.TaskEither<Problem, DatasetVolume> {}

  /**
   * Get the `file_resource` URL of this file, which is the CUBE API URL
   * for downloading the file.
   */
  private getFileResource(): TE.TaskEither<Problem, string> {
    const [dirname, basename] = unsafeSplitPath(this.filePath);
    return pipe(
      this.client.getFewFilesUnder(dirname),
      TE.flatMap((files) => {}),
    );
  }

  /**
   * Get the sidecar data, if any.
   * @private
   */
  private getSidecar(): Option<
    TE.TaskEither<Problem, ChrisViewerFileOptions>
  > {}

  private get filePath(): string {
    return `${this.dataRoot}/${this.info.path}`;
  }

  private get sidecarPath(): Option<string> {
    if (this.info.has_sidecar) {
      return some(`${this.indexRoot}/${this.info.path}`);
    }
    return none;
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

function unsafeSplitPath(path: string): [string, string] {
  const index = path.lastIndexOf("/");
  return [path.substring(0, index), path.substring(index)];
}

export default DatasetFile;
