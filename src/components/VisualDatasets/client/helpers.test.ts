import { test, expect } from "vitest";
import { findVisualDatasetInstancePairs, reduceListOfObjects } from "./helpers";
import getPluginInstances from "./testData/feedplugininstancelist";

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

test("findVisualDatasetInstancePairs", () => {
  const plinstList = getPluginInstances();
  const actual = findVisualDatasetInstancePairs(plinstList.getItems());
  expect(actual).toHaveLength(1);
  const { indexPlinst, dataPlinst } = actual[0];
  expect(indexPlinst.data.plugin_name).toBe("pl-visual-dataset");
  expect(indexPlinst.data.previous_id).toBe(dataPlinst.data.id);
});
