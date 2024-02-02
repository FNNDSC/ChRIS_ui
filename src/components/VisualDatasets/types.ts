import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import React from "react";

/**
 * A feed and a plugin instance of that feed which is a visual dataset.
 *
 * In the current version, a "visual dataset" is a public feed which
 * has exactly one plugin instance of pl-visual-dataset.
 * See https://chrisproject.org/docs/visual_dataset for documentation.
 *
 * In the future, we might want to consider feeds which contain multiple
 * public datasets.
 */
type VisualDataset = { feed: Feed, plugininstance: PluginInstance };


type Problem = {
  variant: "warning" | "success" | "danger" | "info"
  title: string,
  body?: React.ReactNode
};

export type { Problem, VisualDataset };
