import { test, expect } from "vitest";
import { parsePypxDicomDate } from "./client.ts";

test.skip.each([
  ["20200203", new Date(2020, 1, 3)],
  ["2020-02-03", new Date(2020, 1, 3)],
  ["not-a-date", new Date(Number.NaN)],
])("parseDicomDate(%s) -> %o", (value, expected) => {
  const pypxTag = {
    tag: "0008,0020",
    label: "StudyDate",
    value,
  };
  const actual = parsePypxDicomDate(pypxTag);
  expect(actual).toStrictEqual(expected);
});
