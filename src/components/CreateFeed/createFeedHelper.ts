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

export const createFeed = async (
  data: CreateFeedData,
  username: string | null | undefined,
  setUploadFileCallback: (status: number) => void,
  selectedConfig: string[],
  state: PipelineState,
) => {
  const { chrisFiles, localFiles } = data;

  let dirpath: string[] = [];
  let feed: Feed;

  if (selectedConfig.includes("swift_storage")) {
    dirpath = chrisFiles.map((path: string) => path);
  }

  if (selectedConfig.includes("local_select")) {
    const generateUnique = generatePathForLocalFile(data);
    const path = `${username}/uploads/${generateUnique}`;
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

    if (dircopy) {
      const createdInstance = await client.createPluginInstance(
        dircopy.data.id,
        {
          //@ts-ignore
          dir: dirpath.join(","),
        },
      );
      const { pipelineToAdd, computeInfo, titleInfo, selectedPipeline } = state;
      const id = pipelineToAdd?.data.id;
      const resources = selectedPipeline?.[id];
      if (createdInstance) {
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
      }
      throw new Error("Failed to create a dircopy instance");
    }
    return undefined;
  } catch (e: any) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw e;
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

export const getPlugin = async (pluginName: string) => {
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
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw e;
  }
};

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
) => {
  try {
    if (selectedPlugin) {
      const data = await getRequiredObject(
        dropdownInput,
        requiredInput,
        selectedPlugin,
      );
      const pluginId = selectedPlugin.data.id;
      const client = ChrisAPIClient.getClient();
      const fsPluginInstance = await client.createPluginInstance(
        pluginId,
        //@ts-ignore
        data,
      );
      const feed = await fsPluginInstance.getFeed();
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
