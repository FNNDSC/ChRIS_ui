import type {
  Feed,
  Plugin,
  PluginInstance,
  PluginParameter,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  fetchResource,
  limitConcurrency,
  uploadWrapper,
} from "../../api/common";
import type { InputType } from "../AddNode/types";
import { unpackParametersIntoObject } from "../AddNode/utils";
import type { PipelineState } from "../PipelinesCopy/context";
import type { CreateFeedData } from "./types/feed";
import type { AddNodeState } from "../AddNode/types";

export const createFeed = async (
  data: CreateFeedData,
  username: string | null | undefined,
  setUploadFileCallback: (status: number) => void,
  selectedConfig: string[],
  state: PipelineState,
) => {
  const { chrisFiles, localFiles } = data;

  const dirpath: string[] = [];
  let feed: Feed;

  if (selectedConfig.includes("swift_storage")) {
    dirpath.push(...chrisFiles);
  }

  if (selectedConfig.includes("local_select")) {
    const generateUnique = generatePathForLocalFile(data);
    const path = `home/${username}/uploads/${generateUnique}`;
    dirpath.push(path);

    try {
      await uploadLocalFiles(localFiles, path, setUploadFileCallback);
    } catch (error: any) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  }

  try {
    const client = ChrisAPIClient.getClient();
    const dircopy = await getPlugin("pl-dircopy");

    if (!dircopy) {
      throw new Error("Failed to find pl-dircopy. Is pl-dircopy installed? ");
    }

    const createdInstance = await client.createPluginInstance(dircopy.data.id, {
      //@ts-ignore
      dir: dirpath.join(","),
    });

    if (!createdInstance) {
      throw new Error("Failed to create a dircopy instance");
    }

    const { pipelineToAdd, computeInfo, titleInfo, selectedPipeline } = state;
    const id = pipelineToAdd?.data.id;
    const resources = selectedPipeline?.[id];

    if (resources) {
      const { parameters } = resources;

      const nodes_info = client.computeWorkflowNodesInfo(parameters.data);

      for (const node of nodes_info) {
        // Set compute info
        const activeNode = computeInfo?.[id][node.piping_id];
        // Set Title
        const titleSet = titleInfo?.[id][node.piping_id];

        if (activeNode) {
          const compute_node = activeNode.currentlySelected;
          node.compute_resource_name = compute_node;
        }

        if (titleSet) {
          node.title = titleSet;
        }
      }

      await client.createWorkflow(id, {
        previous_plugin_inst_id: createdInstance.data.id,
        nodes_info: JSON.stringify(nodes_info),
      });
    }

    feed = (await createdInstance.getFeed()) as Feed;
    return feed;
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
