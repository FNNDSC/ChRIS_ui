import { test, expect } from "vitest";
import { map, some } from "fp-ts/Option";
import { match } from "fp-ts/Either";
import { getReadmeAndManifestFiles } from "./getDatasetClient.ts";
import { getSanePlVisualDatasetFiles } from "./testData/plVisualDatasetFilebrowserFiles.ts";
import { pipe } from "fp-ts/function";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";

test("getReadmeAndManifestFileResources", () => {
  const data = getSanePlVisualDatasetFiles();
  pipe(
    getReadmeAndManifestFiles(data),
    match(
      (e) => expect.fail(`Error: ${e}`),
      ({ readmeFile, manifestFile }) => {
        expect(manifestFile.file_resource).toBe(
          "https://example.org/api/v1/files/2159/.chrisvisualdataset.tagmanifest.json",
        );
        expect(
          map((f: FpFileBrowserFile) => f.file_resource)(readmeFile),
        ).toStrictEqual(
          some("https://example.org/api/v1/files/2148/README.txt"),
        );
      },
    ),
  );
});
