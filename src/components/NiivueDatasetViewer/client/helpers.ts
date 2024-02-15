import { PluginInstance } from "@fnndsc/chrisapi";
import { constants } from "../../../datasets";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { Problem, VisualDataset } from "../types";
import { Either, left, right } from "fp-ts/Either";
import problems from "./problems.tsx";

function parsePluginInstanceId(s: string): Either<Problem, number> {
  const num = parseInt(s);
  if (isNaN(num)) {
    return left(problems.invalidPluginInstanceId(s));
  }
  return right(num);
}

/**
 * Find plugin instances of `pl-visual-dataset` and return them along with their
 * parent plugin instance.
 */
function findVisualDatasetInstancePairs(
  plinsts: readonly PluginInstance[],
): Pick<VisualDataset, "dataPlinst" | "indexPlinst">[] {
  return plinsts.filter(isPlVisualDataset).map((indexPlinst) => {
    const prev = indexPlinst.data.previous_id;
    const dataPlinst = plinsts.find((p) => p.data.id === prev);
    if (dataPlinst === undefined) {
      // the calling function already checks and warns if `plinsts` does not
      // contain all plugin instances of a feed, so we're going to badly
      // throw an Error here.
      throw new Error(
        `Previous not found for pl-visual-dataset plugin instance id=${indexPlinst.data.id} previous_id=${prev}`,
      );
    }
    return { indexPlinst, dataPlinst };
  });
}

function isPlVisualDataset(plinst: PluginInstance): boolean {
  const { plugin_name, plugin_version } = plinst.data;
  return (
    plugin_name === "pl-visual-dataset" && isCompatibleVersion(plugin_version)
  );
}

function isCompatibleVersion(pluginVersion: string): boolean {
  return (
    constants.COMPATIBLE_PL_VISUAL_DATASET_VERSIONS.findIndex(
      (v) => v === pluginVersion,
    ) !== -1
  );
}

/**
 * Reduce list of objects into one object.
 */
function reduceListOfObjects<T extends { [key: string]: object[] }>(
  x: ReadonlyNonEmptyArray<T>,
): T {
  const acc = Object.fromEntries(
    Object.keys(x[0]).map((key) => [key, [] as object[]]),
  );
  for (const ele of x) {
    for (const [key, sublist] of Object.entries(ele)) {
      for (const item of sublist) {
        acc[key].push(item);
      }
    }
  }
  return acc as T;
}

export {
  findVisualDatasetInstancePairs,
  reduceListOfObjects,
  parsePluginInstanceId,
};
