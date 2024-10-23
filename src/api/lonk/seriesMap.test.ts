import { test, expect } from "vitest";
import SeriesMap from "./seriesMap.ts";

test("SeriesMap", () => {
  const map = new SeriesMap();
  expect(map.pop("MyPACS", "12345")).toBeNull();
  const data = {};
  map.set("MyPACS", "12345", data);
  expect(map.pop("MyPACS", "12345")).toBe(data);
  expect(map.pop("MyPACS", "12345")).toBeNull();
});
