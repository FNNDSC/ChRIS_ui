import * as TE from "fp-ts/TaskEither";
import { Option, map } from "fp-ts/Option";
import { PluginInstance } from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import { Problem, VisualDataset } from "../types.ts";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";
import { pipe } from "fp-ts/function";
import { parse as parseJson } from "fp-ts/Json";
import { DatasetFilesClient } from "./DatasetFilesClient.ts";
import problems from "./problems.tsx";
import { Manifest } from "./models.ts";

/**
 * A client for retrieving the README and manifest.
 */
class DatasetPreClient {
  private readonly client: FpClient;
  private readonly indexPlinst: PluginInstance;
  private readonly dataPlinst: PluginInstance;

  private readonly readmeFile: Option<FpFileBrowserFile>;
  private readonly manifestFile: FpFileBrowserFile;

  constructor(
    client: FpClient,
    dataset: VisualDataset,
    readmeFile: Option<FpFileBrowserFile>,
    manifestFile: FpFileBrowserFile,
  ) {
    this.client = client;
    this.dataPlinst = dataset.dataPlinst;
    this.indexPlinst = dataset.indexPlinst;
    this.readmeFile = readmeFile;
    this.manifestFile = manifestFile;
  }

  /**
   * Get the README.txt file's content.
   */
  public getReadme(): Option<TE.TaskEither<Problem, string>> {
    return pipe(
      this.readmeFile,
      map((file) =>
        pipe(
          file.getAsText(),
          TE.mapLeft(() => problems.failedRequestForFile(file)),
        ),
      ),
    );
  }

  /**
   * Get the manifest and create the "full client" which is capable of getting
   * files from this dataset.
   */
  public getFilesClient(): TE.TaskEither<Problem, DatasetFilesClient> {
    return pipe(
      this.manifestFile.getAsText(),
      TE.mapLeft(() => problems.failedRequestForFile(this.manifestFile)),
      TE.flatMap((data) => {
        return pipe(
          parseJson(data),
          TE.fromEither,
          TE.mapLeft(() => problems.invalidJson(this.manifestFile.fname)),
        );
      }),
      // going to assume JSON matches schema without validation!
      TE.map((data) => data as Manifest),
      TE.map(
        (manifestData) =>
          new DatasetFilesClient(
            this.client,
            this.dataPlinst,
            this.indexPlinst,
            manifestData,
          ),
      ),
    );
  }
}

export { DatasetPreClient };
