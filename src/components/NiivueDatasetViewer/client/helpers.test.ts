import { test, expect } from "vitest";
import { reduceListOfObjects } from "./helpers";

test("reduceListOfObjects", () => {
  const data = [
    {
      food: [],
      flavors: ["salty"],
    },
    {
      food: ["apple", "honey"],
      flavors: ["sweet"],
    },
    {
      food: ["toast"],
      flavors: ["bitter", "umami"],
    },
  ];
  const expected = {
    food: ["apple", "honey", "toast"],
    flavors: ["salty", "sweet", "bitter", "umami"],
  };
  const actual = reduceListOfObjects(data);
  expect(actual).toStrictEqual(expected);
});
