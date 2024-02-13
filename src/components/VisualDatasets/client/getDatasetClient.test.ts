import { test, expect } from "vitest";
import { right } from "fp-ts/Either";
import { some } from "fp-ts/Option";
import { getReadmeAndManifestFileResources } from "./getDatasetClient.ts";
import { getSanePlVisualDatasetFiles } from "./testData/plVisualDatasetFilebrowserFiles.ts";

test("getReadmeAndManifestFileResources", () => {
  const data = getSanePlVisualDatasetFiles();
  const actual = getReadmeAndManifestFileResources(data);
  const expected = right({
    readmeFileResource: some(
      "https://example.org/api/v1/files/2148/README.txt",
    ),
    manifestFileResource:
      "https://example.org/api/v1/files/2159/.chrisvisualdataset.tagmanifest.json",
  });
  expect(actual).toStrictEqual(expected);
});
