import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";
import { Option, match } from "fp-ts/Option";
import { findFirst } from "fp-ts/ReadonlyArray";
import { Problem, VisualDataset } from "../types.ts";
import DatasetMetadataClient from "./DatasetMetadataClient.ts";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import constants from "./constants.ts";
import { Either, left, right, mapLeft } from "fp-ts/Either";
import problems from "./problems.tsx";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";

function getMetadataClient(
  client: FpClient,
  dataset: VisualDataset,
): TE.TaskEither<Problem, DatasetMetadataClient> {
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
        new DatasetMetadataClient(client, dataset, readmeFile, manifestFile),
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

export { getMetadataClient, getReadmeAndManifestFiles };
