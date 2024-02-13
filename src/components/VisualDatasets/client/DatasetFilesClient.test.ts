import { test, expect } from "vitest";
import Client from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import getPluginInstances from "./testData/feedplugininstancelist.ts";
import {
  DatasetFilesClient,
  isSubset,
  matchOptionsTo,
} from "./DatasetFilesClient.ts";
import manifestData from "./testData/chrisvisualdataset.tagmanifest.json";
import { Manifest, OptionsLink, TagSet } from "./models.ts";

const manifest = manifestData as unknown as Manifest;

test("DatasetFilesClient.listFiles", () => {
  const client = getClient();
  const plinstItems = getPluginInstances();
  const dataPlinst = plinstItems.getItem(37);
  const indexPlinst = plinstItems.getItem(38);
  const filesClient = new DatasetFilesClient(
    client,
    dataPlinst,
    indexPlinst,
    manifest,
  );
  expect(filesClient.listFiles().length).toBeTruthy(); // dumb test
});

test("matchOptionsTo", () => {
  const options: ReadonlyArray<OptionsLink> = [
    {
      match: {
        color: "red",
      },
      options: {
        name: "Red Thing",
      },
    },
    {
      match: { color: "green" },
      options: { name: "Green Thing" },
    },
    {
      match: { color: "red", shape: "sphere" },
      options: { author: "apple tree" },
    },
  ];
  const tags = {
    color: "red",
    shape: "sphere",
    nutritious: "yes",
  };
  const actual = matchOptionsTo(tags, options);
  const expected = {
    name: "Red Thing",
    author: "apple tree",
  };
  expect(actual).toStrictEqual(expected);
});

test.each([
  [{}, {}, true],
  [{ color: "blue" }, {}, true],
  [{}, { color: "blue" }, false],
  [{ color: "blue" }, { color: "blue" }, true],
  [{ color: "blue", shape: "square" }, { color: "blue" }, true],
  [
    { color: "blue", shape: "square" },
    { color: "blue", shape: "square" },
    true,
  ],
  [
    { color: "blue", shape: "square" },
    { color: "blue", shape: "square", rating: "5" },
    false,
  ],
])(
  "isSubset(%o, %o) -> %s",
  (tags: TagSet, match: TagSet, expected: boolean) => {
    expect(isSubset(tags, match)).toBe(expected);
  },
);

function getClient(): FpClient {
  return new FpClient(new Client("https://example.org/api/v1/"));
}
