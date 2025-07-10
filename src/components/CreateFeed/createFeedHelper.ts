import type { Plugin, PluginInstance, PluginParameter } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  fetchResource,
  limitConcurrency,
  uploadWrapper,
} from "../../api/common";
import type { InputType } from "../AddNode/types";
import { unpackParametersIntoObject } from "../AddNode/utils";
import type { PipelineState } from "../PipelinesCopy/context";
import type { ChRISFeed, CreateFeedData } from "./types/feed";
import type { AddNodeState } from "../AddNode/types";
import { computeWorkflowNodesInfo, getFullFeedName } from "./utils";

import {
  createWorkflow,
  GetFeed,
  searchPluginsByName,
  createPluginInstance as serverCreatePluginInstance,
  updateFeedName,
} from "../../api/serverApi";

const createFeedCore = async (
  dirpath: ChRISFeed[],
  fullFeedName: string,
  pipelineState: PipelineState,
) => {
  const searchPluginsResult = await searchPluginsByName("pl-dircopy");
  console.info(
    "createFeedCore: after searchPluginsByName: searchPluginsResult:",
    searchPluginsResult,
  );
  if (!searchPluginsResult || !searchPluginsResult.data) {
    throw new Error("Failed to find pl-dircopy. Is pl-dircopy installed? ");
  }

  const dircopy = searchPluginsResult.data[0];

  console.info("createFeedCore: dircopy:", dircopy);

  const theDirs = dirpath.map((each) => each.filename);

  const createdInstance = await serverCreatePluginInstance(dircopy.id, theDirs);

  console.info(
    "createFeedCore: after serverCreatePluginInstance: createdInstance:",
    createdInstance,
  );

  if (!createdInstance || !createdInstance.data) {
    throw new Error("Failed to create a dircopy instance");
  }

  const { pipelineToAdd, computeInfo, titleInfo, selectedPipeline } =
    pipelineState;

  const pipelineID = pipelineToAdd?.data.id;
  const resources = selectedPipeline?.[pipelineID];

  console.info(
    "createFeedCore: pipelineID:",
    pipelineID,
    "resources:",
    resources,
  );

  if (resources) {
    const { parameters } = resources;

    const nodes_info = computeWorkflowNodesInfo(parameters.data);

    for (const node of nodes_info) {
      // Set compute info
      const activeNode = computeInfo?.[pipelineID][node.piping_id];
      // Set Title
      const titleSet = titleInfo?.[pipelineID][node.piping_id];

      if (activeNode) {
        const compute_node = activeNode.currentlySelected;
        node.compute_resource_name = compute_node;
      }

      if (titleSet) {
        node.title = titleSet;
      }

      console.info(
        "createFeedCore: pipelineID:",
        pipelineID,
        "computeInfo:",
        computeInfo,
        "activeNode:",
        activeNode,
        "titleInfo:",
        titleInfo,
        "titleSet:",
        titleSet,
        "node:",
        node,
      );
    }

    console.info(
      "createFeedCore: to createWorkflow: pipelineID:",
      pipelineID,
      "nodes_info:",
      nodes_info,
    );

    await createWorkflow(pipelineID, createdInstance.data.id, nodes_info);
  }

  const feedID = createdInstance.data?.feed_id || 0;
  const feed = GetFeed(feedID);

  await updateFeedName(feedID, fullFeedName);

  return feed;
};

export const createFeeds = async (
  data: CreateFeedData,
  username: string | null | undefined,
  setUploadFileCallback: (status: number) => void,
  createFeedConfig: string[],
  pipelineState: PipelineState,
) => {
  const { chrisFiles, feedName } = data;

  try {
    await chrisFiles.map(async (eachChRISFile) => {
      const dirpath = [eachChRISFile];
      const fullFeedName = await getFullFeedName(feedName, eachChRISFile);
      console.info(
        "createFeeds: to createFeedCore: fullFeedName:",
        fullFeedName,
      );
      const feed = await createFeedCore(dirpath, fullFeedName, pipelineState);
      Promise.resolve(feed).then((resolvedFeed) => {
        console.info("createFeeds: resolvedFeed:", resolvedFeed);
      });
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }

    throw new Error("Unhandled error. Failed to create a Feed.");
  }
};

export const uploadLocalFiles = async (
  files: File[],
  directory: string,
  statusCallback: (value: number) => void,
) => {
  const client = ChrisAPIClient.getClient();
  await client.setUrls();

  const fileUploads = uploadWrapper(files, directory, client.auth.token);
  const promises = fileUploads.map(
    ({ promise }) =>
      () =>
        promise,
  );

  await limitConcurrency(4, promises, (progress: number) => {
    statusCallback(progress);
  });
};

function generatePathForLocalFile(data: CreateFeedData) {
  const randomCode = Math.floor(Math.random() * 100);
  const normalizedFeedName = data.feedName
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/ /g, "-")
    .replace(/\//g, "");
  return `${normalizedFeedName}-upload-${randomCode}`;
}

export const getPlugin = async (
  pluginName: string,
): Promise<Plugin | undefined> => {
  const client = ChrisAPIClient.getClient();

  try {
    const pluginList = await client.getPlugins({
      name_exact: pluginName,
    });
    let plugin: Plugin[] = [];
    if (pluginList.getItems()) {
      plugin = pluginList.getItems() as Plugin[];
      return plugin[0];
    }
    return undefined;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
};

export const createFeedInstanceWithFS = async (state: AddNodeState) => {
  const {
    dropdownInput,
    requiredInput,
    advancedConfig,
    selectedComputeEnv,
    selectedPluginFromMeta: selectedPlugin,
    memoryLimit,
  } = state;

  try {
    if (selectedPlugin) {
      const { advancedConfigErrors, sanitizedInput } = sanitizeAdvancedConfig(
        advancedConfig,
        memoryLimit,
      );

      if (Object.keys(advancedConfigErrors).length > 0) {
        throw new Error("Advanced config errors");
      }

      const parameterInput = await getParameterInput(
        dropdownInput,
        requiredInput,
        selectedPlugin,
        selectedComputeEnv,
        sanitizedInput,
      );

      const { feed } = await createPluginInstance(
        selectedPlugin.data.id,
        parameterInput,
      );
      return feed;
    }

    return undefined;
  } catch (e: any) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw e;
  }
};

const stripQuotes = (value: string) => {
  if (typeof value === "string") {
    const singleQuoted = value.startsWith("'") && value.endsWith("'");
    const doubleQuoted = value.startsWith('"') && value.endsWith('"');
    if (singleQuoted || doubleQuoted) {
      return value.slice(1, -1);
    }
  }
  return value;
};

export const getRequiredObject = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  plugin: Plugin,
  selected?: PluginInstance,
) => {
  let dropdownUnpacked = {};
  let requiredUnpacked = {};
  const mappedParameter: {
    [key: string]: string | boolean;
  } = {};

  if (dropdownInput) {
    dropdownUnpacked = unpackParametersIntoObject(dropdownInput);
  }

  if (requiredInput) {
    requiredUnpacked = unpackParametersIntoObject(requiredInput);
  }

  const nodeParameter: {
    [key: string]: {
      [key: string]: string;
    };
  } = {
    ...dropdownUnpacked,
    ...requiredUnpacked,
  };

  try {
    const paginate = { limit: 30, offset: 0 };
    const fn = plugin.getPluginParameters;
    const boundFn = fn.bind(plugin);
    const { resource: params } = await fetchResource<PluginParameter>(
      paginate,
      boundFn,
    );

    for (let i = 0; i < params.length; i++) {
      const flag = params[i].data.flag;
      const defaultValue = params[i].data.default;
      if (Object.keys(nodeParameter).includes(flag)) {
        let value: string | boolean = stripQuotes(nodeParameter[flag].value);
        const type = nodeParameter[flag].type;

        if (value === "" && type === "boolean") {
          if (defaultValue === false) {
            value = true;
          } else {
            value = false;
          }
        } else if (value === "" || value === "undefined") {
          value = defaultValue;
        }
        mappedParameter[params[i].data.name] = value;
      }
    }

    let parameterInput = {};
    if (selected) {
      parameterInput = {
        ...mappedParameter,
        previous_id: selected.data.id as number,
      };
    } else {
      parameterInput = {
        ...mappedParameter,
      };
    }

    return parameterInput;
  } catch (error: any) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw error;
  }
};

export const sanitizeAdvancedConfig = (
  advancedConfig: Record<string, string>,
  memoryLimit: string,
) => {
  const advancedConfigErrors: Record<string, string> = {};
  const sanitizedInput: Record<string, string> = {};

  for (const key in advancedConfig) {
    const inputValue = +advancedConfig[key];

    if (Number.isNaN(inputValue)) {
      advancedConfigErrors[key] = "A valid integer is required";
    } else {
      if (key === "cpu_limit") {
        sanitizedInput[key] = `${inputValue * 1000}m`;
      }
      if (key === "memory_limit") {
        sanitizedInput[key] = `${inputValue}${memoryLimit}`;
      }
    }
  }

  return { advancedConfigErrors, sanitizedInput };
};

export const createPluginInstance = async (
  pluginId: number,
  parameterInput: Record<string, any>,
) => {
  const client = ChrisAPIClient.getClient();
  const pluginInstance = await client.createPluginInstance(
    pluginId,
    //@ts-ignore
    parameterInput,
  );
  const feed = await pluginInstance.getFeed();
  return { pluginInstance, feed };
};

export const getParameterInput = async (
  dropdownInput: Record<string, any>,
  requiredInput: Record<string, any>,
  plugin: any,
  selectedComputeEnv: string,
  sanitizedInput: Record<string, any>,
  selectedPlugin?: PluginInstance,
) => {
  let parameterInput = await getRequiredObject(
    dropdownInput,
    requiredInput,
    plugin,
    selectedPlugin,
  );
  parameterInput = {
    ...parameterInput,
    compute_resource_name: selectedComputeEnv,
    ...sanitizedInput,
  };
  return parameterInput;
};
