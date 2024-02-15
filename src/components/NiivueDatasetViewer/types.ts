import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import React from "react";

/**
 * A "Visual Dataset" in _ChRIS_ comprises two plugin instances:
 *
 * - The "parent" plugin instance contains data (NIFTI files)
 * - The "child" plugin instance contains metadata (tags manifest and JSON
 *   sidecars)
 *
 * INVARIANTS:
 *
 * - `dataPlinst` is the previous plugin instance of `indexPlinst`
 * - `indexPlinst` is a plugin instance of `pl-visual-dataset`
 */
type VisualDataset = {
  dataPlinst: PluginInstance;
  indexPlinst: PluginInstance;
};

/**
 * The result of trying to get datasets from CUBE. Getting datasets
 * involves multiple HTTP requests and can return [0, n) datasets,
 */
type GetDatasetsResult = {
  errors: Problem[];
  datasets: VisualDataset[];
};

/**
 * A UI-friendly message about abnormal happenings.
 */
type Problem = {
  variant: "warning" | "success" | "danger" | "info";
  title: React.ReactNode;
  body?: React.ReactNode;
};

export type { Problem, VisualDataset, GetDatasetsResult };
