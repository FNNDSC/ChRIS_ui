import api from "./api";
import type {
  Feed,
  PluginInstance,
  Plugin,
  NodeInfo,
  UploadPipeline,
} from "./types";

import YAML from "yaml";

export const GetFeedPluginInstances = (feedID: number) =>
  api<PluginInstance[]>({
    endpoint: `/${feedID}/plugininstances/`,
    method: "get",
  });

export const GetFeed = (feedID: number) =>
  api<Feed>({
    endpoint: `/${feedID}/`,
    method: "get",
  });

export const updateFeedName = (feedID: number, feedName: string) =>
  api<Feed>({
    endpoint: `/${feedID}/`,
    method: "put",
    json: {
      name: feedName,
    },
  });

export const searchPluginsByName = (pluginName: string) =>
  api<Plugin[]>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: pluginName,
    },
  });

export const createPluginInstance = (pluginID: number, theDirs: string[]) =>
  api<PluginInstance>({
    endpoint: `/plugins/${pluginID}/instances/`,
    method: "post",
    json: {
      dir: theDirs.join(","),
    },
  });

export const createWorkflow = (
  pipelineID: number,
  previousPluginInstanceID: number,
  nodesInfo: NodeInfo[],
) =>
  api({
    endpoint: `/pipelines/${pipelineID}/workflows/`,
    method: "post",
    json: {
      template: {
        data: [
          {
            name: "previous_plugin_inst_id",
            value: `${previousPluginInstanceID}`,
          },
          { name: "nodes_info", value: JSON.stringify(nodesInfo) },
        ],
      },
    },
    headers: {
      "Content-Type": "application/vnd.collection+json",
    },
  });

export const createPipeline = (pipeline: UploadPipeline) =>
  api({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });
