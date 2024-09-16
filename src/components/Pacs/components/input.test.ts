import { test, expect } from "vitest";
import { isQueryEmpty } from "./input.tsx";

test.each([
  [null, true],
  [{}, true],
  [{ patientID: "" }, true],
  [{ patientID: "", AccessionNumber: "" }, true],
  [{ patientID: "bob" }, false],
])("isQueryEmpty(%o) -> %b", (query, expected) => {
  expect(isQueryEmpty(query)).toBe(expected);
});
