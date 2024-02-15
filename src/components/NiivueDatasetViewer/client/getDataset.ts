import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";
import { Option, match } from "fp-ts/Option";
import { findFirst } from "fp-ts/ReadonlyArray";
import { constants } from "../../../datasets";
import { DatasetPreClient } from "./DatasetPreClient";
import { FpClient, FpFileBrowserFile } from "../../../api/fp/chrisapi";
import { Either, left, right, mapLeft } from "fp-ts/Either";
import problems from "./problems";
import { Problem, VisualDataset } from "../types";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";

/**
 * Get the plugin instance and its previous plugin instance.
 */
function getDataset(
  client: FpClient,
  plinstId: number,
): TE.TaskEither<Problem, VisualDataset> {
  return pipe(
    client.getPluginInstance(plinstId),
    TE.mapLeft(problems.failedRequestForPluginInstance(plinstId)),
    TE.flatMap((indexPlinst) =>
      pipe(
        FpClient.getPreviousPluginInstance(indexPlinst),
        TE.mapLeft(problems.failedRequestForPreviousOf(indexPlinst)),
        TE.flatMap((dataPlinst) => {
          if (dataPlinst === null) {
            const problem = problems.hasNoPrevious(indexPlinst);
            return TE.fromEither(left(problem));
          }
          return TE.fromEither(right({ dataPlinst, indexPlinst }));
        }),
      ),
    ),
  );
}

/**
 * Get the feed of the visual dataset.
 */
function getFeedOf(plinst: PluginInstance): TE.TaskEither<Problem, Feed> {
  return pipe(
    FpClient.getFeedOf(plinst),
    TE.mapLeft(() => problems.failedRequestForFeedOf(plinst)),
  );
}

/**
 * Creates a `DatasetPreClient` by finding the README and manifest files.
 */
function getPreClient(
  client: FpClient,
  dataset: VisualDataset,
): TE.TaskEither<Problem, DatasetPreClient> {
  return pipe(
    client.getFewFilesUnder(dataset.indexPlinst.data.output_path),
    TE.mapLeft((_e) => problems.failedToGetFilesOf(dataset.indexPlinst)),
    TE.flatMap(
      flow(
        getReadmeAndManifestFiles,
        errorBecauseManifestMissingFrom(dataset),
        TE.fromEither,
      ),
    ),
    TE.map(
      ({ readmeFile, manifestFile }) =>
        new DatasetPreClient(client, dataset, readmeFile, manifestFile),
    ),
  );
}

function errorBecauseManifestMissingFrom(
  dataset: VisualDataset,
): <A>(e: Either<unknown, A>) => Either<Problem, A> {
  return (e) => {
    return pipe(
      e,
      mapLeft(() => problems.manifestNotFoundIn(dataset)),
    );
  };
}

function getReadmeAndManifestFiles(
  files: ReadonlyArray<FpFileBrowserFile>,
): Either<
  Error,
  { readmeFile: Option<FpFileBrowserFile>; manifestFile: FpFileBrowserFile }
> {
  const readmeFile = pipe(
    files,
    findFirst((f) => f.fname.endsWith(constants.README_FILENAME)),
  );
  const manifestFileOption = pipe(
    files,
    findFirst((f) => f.fname.endsWith(constants.MAGIC_DATASET_FILE)),
  );
  return pipe(
    manifestFileOption,
    match(
      () => left(new Error("manifest not found in files")),
      (manifestFile) =>
        right({
          readmeFile,
          manifestFile,
        }),
    ),
  );
}

export { getDataset, getFeedOf, getPreClient, getReadmeAndManifestFiles };
