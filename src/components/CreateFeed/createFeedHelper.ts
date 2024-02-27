import {
  Plugin,
  PluginInstance,
  PluginParameter,
  Feed,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { InputType } from "../AddNode/types";
import { unpackParametersIntoObject } from "../AddNode/utils";
import { CreateFeedData } from "./types/feed";

import {
  catchError,
  fetchResource,
  limitConcurrency,
  uploadWrapper,
} from "../../api/common";
import { PipelineState } from "../PipelinesCopy/context";

export function getName(selectedConfig: string) {
  if (selectedConfig === "fs_plugin") {
    return "Analysis Creation using an FS Plugin";
  }
  if (selectedConfig === "file_select") {
    return "Analysis Creation using File Select";
  }
  return "Analysis Creation";
}

export const createFeed = async (
  data: CreateFeedData,
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  username: string | null | undefined,
  setUploadFileCallback: (status: number) => void,
  setErrorCallback: (error: any) => void,
  selectedConfig: string[],
  state: PipelineState,
) => {
  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed: Feed | undefined | null;

  if (
    selectedConfig.includes("local_select") ||
    selectedConfig.includes("swift_storage")
  ) {
    feed = await createFeedInstanceWithDircopy(
      data,
      username,
      setUploadFileCallback,
      setErrorCallback,
      selectedConfig,
      state,
    );
  } else if (selectedConfig.includes("fs_plugin")) {
    feed = await createFeedInstanceWithFS(
      dropdownInput,
      requiredInput,
      selectedPlugin,
      setErrorCallback,
    );
  }
  return feed;
};

export const createFeedInstanceWithDircopy = async (
  data: CreateFeedData,
  username: string | null | undefined,
  setUploadFileCallback: (value: number) => void,
  errorCallback: (error: any) => void,
  selectedConfig: string[],
  state: PipelineState,
) => {
  const { chrisFiles, localFiles } = data;
  const dirpath: string[] = [];

  if (selectedConfig.includes("swift_storage")) {
    dirpath.push(...chrisFiles);
  }

  if (selectedConfig.includes("local_select")) {
    const generateUnique = generatePathForLocalFile(data);
    const path = `${username}/uploads/${generateUnique}`;
    dirpath.push(path);

    try {
      await uploadLocalFiles(localFiles, path, setUploadFileCallback);
    } catch (error) {
      errorCallback(catchError(error));
      return null;
    }
  }

  try {
    const client = ChrisAPIClient.getClient();
    const dircopy = await getPlugin("pl-dircopy");

    if (!(dircopy instanceof Plugin)) {
      return null;
    }

    const createdInstance = await client.createPluginInstance(dircopy.data.id, {
      //@ts-ignore
      dir: dirpath.join(","),
    });

    const { pipelineToAdd, computeInfo, titleInfo, selectedPipeline } = state;
    const id = pipelineToAdd?.data.id;
    const resources = selectedPipeline?.[id];

    if (createdInstance && resources) {
      const { parameters } = resources;
      const nodes_info = client.computeWorkflowNodesInfo(parameters.data);

      for (const node of nodes_info) {
        const activeNode = computeInfo?.[id][node.piping_id];
        const titleSet = titleInfo?.[id][node.piping_id];

        if (activeNode) {
          node.compute_resource_name = activeNode.currentlySelected;
        }

        if (titleSet) {
          node.title = titleSet;
        }
      }

      await client.createWorkflow(id, {
        previous_plugin_inst_id: createdInstance.data.id,
        nodes_info: JSON.stringify(nodes_info),
      });

      return (await createdInstance.getFeed()) as Feed;
    }

    return null;
  } catch (error) {
    errorCallback(catchError(error));
    return null;
  }
};

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  errorCallback: (error: any) => void,
) => {
  let feed: Feed | null = null;
  if (selectedPlugin) {
    if (selectedPlugin instanceof Plugin) {
      const data = await getRequiredObject(
        dropdownInput,
        requiredInput,
        selectedPlugin,
        errorCallback,
      );
      const pluginId = selectedPlugin.data.id;
      const client = ChrisAPIClient.getClient();
      try {
        const fsPluginInstance = await client.createPluginInstance(
          pluginId,
          //@ts-ignore
          data,
        );
        feed = await fsPluginInstance.getFeed();
      } catch (error) {
        const errorObj = catchError(error);
        errorCallback(errorObj);
      }
    }
  }
  return feed;
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

export const getPlugin = async (pluginName: string) => {
  const client = ChrisAPIClient.getClient();
  const pluginList = await client.getPlugins({
    name_exact: pluginName,
  });
  let plugin: Plugin[] = [];
  if (pluginList.getItems()) {
    plugin = pluginList.getItems() as Plugin[];
    return plugin[0];
  } else return [];
};

export const getRequiredObject = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  plugin: Plugin,
  errorCallback: (error: any) => void,
  selected?: PluginInstance,
) => {
  let dropdownUnpacked;
  let requiredUnpacked;
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
        let value: string | boolean = nodeParameter[flag].value;
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

    let parameterInput;
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
  } catch (error) {
    const errorObj = catchError(error);
    errorCallback(errorObj);
  }
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
