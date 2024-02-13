import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";
import { none, some, Option, match } from "fp-ts/Option";
import { findFirstMap } from "fp-ts/ReadonlyArray";
import { Problem, VisualDataset } from "../types.ts";
import VisualDatasetClient from "./VisualDatasetClient.ts";
import { FpClient } from "../../../api/fp-chrisapi.ts";
import { FilebrowserFile } from "../../../api/types.ts";
import constants from "./constants.ts";
import { Either, left, right, mapLeft } from "fp-ts/Either";
import problems from "./problems.tsx";

function getDatasetClient(
  client: FpClient,
  dataset: VisualDataset,
): TE.TaskEither<Problem, VisualDatasetClient> {
  return pipe(
    client.getFewFilesUnder(dataset.indexPlinst.data.output_path),
    TE.mapLeft((_e) => problems.failedToGetFilesOf(dataset.indexPlinst)),
    TE.flatMap(
      flow(
        getReadmeAndManifestFileResources,
        errorBecauseManifestMissingFrom(dataset),
        TE.fromEither,
      ),
    ),
    TE.map(
      ({ readmeFileResource, manifestFileResource }) =>
        new VisualDatasetClient(
          client,
          dataset,
          readmeFileResource,
          manifestFileResource,
        ),
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

type ReadmeAndManifestFileResource = {
  readmeFileResource: Option<string>;
  manifestFileResource: string;
};

function getReadmeAndManifestFileResources(
  files: ReadonlyArray<FilebrowserFile>,
): Either<Error, ReadmeAndManifestFileResource> {
  const readmeFileResource = pipe(
    files,
    findFirstMap(fileResourceIfEndsWith(constants.README_FILENAME)),
  );
  const manifestFileResource = pipe(
    files,
    findFirstMap(fileResourceIfEndsWith(constants.MAGIC_DATASET_FILE)),
  );
  return pipe(
    manifestFileResource,
    match(
      () => left(new Error("manifest not found in files")),
      (manifestFileResource) =>
        right({
          readmeFileResource,
          manifestFileResource,
        }),
    ),
  );
}

function fileResourceIfEndsWith(filename: string) {
  return (file: FilebrowserFile): Option<string> => {
    if (file.fname.endsWith(filename)) {
      return some(file.file_resource);
    }
    return none;
  };
}

export { getDatasetClient, getReadmeAndManifestFileResources };
