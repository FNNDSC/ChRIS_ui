import { unpackParametersIntoObject } from "../../AddNode/lib/utils";
import { CreateFeedData, LocalFile, PipelineData } from "../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { InputType } from "../../AddNode/types";
import { Plugin, PluginInstance, PluginParameter } from "@fnndsc/chrisapi";
import { uploadFilePaths } from "../../../../store/workflows/utils";
import { fetchResource } from "../../../../utils";

let cache: number[] = [];

export function getName(selectedConfig: string) {
  if (selectedConfig === "fs_plugin") {
    return "Feed Creation using an FS Plugin";
  } else if (selectedConfig === "file_select") {
    return "Feed Creation using File Select";
  } else return "Feed Creation";
}

export const createFeed = async (
  data: CreateFeedData,
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  username: string | null | undefined,
  pipelineData: PipelineData,
  setProgressCallback: (status: string) => void,
  setErrorCallback: (error: string) => void,
  selectedPipeline?: number
) => {
  const { chrisFiles, localFiles } = data;

  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed;
  setProgressCallback("Started");

  if (chrisFiles.length > 0 || localFiles.length > 0) {
    feed = await createFeedInstanceWithDircopy(
      data,
      username,
      pipelineData,
      setProgressCallback,
      setErrorCallback,
      selectedPipeline
    );
  } else if (dropdownInput || requiredInput) {
    feed = await createFeedInstanceWithFS(
      dropdownInput,
      requiredInput,
      selectedPlugin,
      setProgressCallback,
      setErrorCallback
    );
  }
  return feed;
};

export const createFeedInstanceWithDircopy = async (
  data: CreateFeedData,
  username: string | null | undefined,
  pipelineData: PipelineData,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void,
  selectedPipeline?: number
) => {
  const { chrisFiles, localFiles } = data;

  let dirpath: string[] = [];

  if (chrisFiles.length > 0 && localFiles.length > 0) {
    statusCallback("Compute files from swift storage and local file upload");
    dirpath = chrisFiles.map((path: string) => path);
    const local_upload_path = `${username}/uploads/${generatePathForLocalFile(
      data
    )}`;

    try {
      await uploadLocalFiles(localFiles, local_upload_path, statusCallback);
    } catch (error) {
      errorCallback(error as string);
    }
    const filePaths = uploadFilePaths(localFiles, local_upload_path);
    dirpath.push(filePaths);
  } else if (chrisFiles.length > 0 && localFiles.length === 0) {
    statusCallback("Compute Paths from swift storage");
    dirpath = chrisFiles.map((path: string) => path);
  } else if (localFiles.length > 0 && chrisFiles.length === 0) {
    statusCallback("Compute Paths from local file upload");
    const local_upload_path = `${username}/uploads/${generatePathForLocalFile(
      data
    )}`;
    try {
      await uploadLocalFiles(localFiles, local_upload_path, statusCallback);
    } catch (error) {
      errorCallback(error as string);
    }
    const filePaths = uploadFilePaths(localFiles, local_upload_path);

    dirpath.push(filePaths);
  }

  let feed;

  try {
    const dircopy = await getPlugin("pl-dircopy");
    if (dircopy instanceof Plugin) {
      const dircopyInstance = await dircopy.getPluginInstances();
      await dircopyInstance.post({
        dir: dirpath.join(","),
      });
      // clear global cache
      cache = [];
      statusCallback("Creating Plugin Instance");
      //when the `post` finishes, the dircopyInstances's internal collection is updated
      let createdInstance: PluginInstance = {} as PluginInstance;

      if (dircopyInstance.getItems()) {
        const pluginInstanceList =
          dircopyInstance.getItems() as PluginInstance[];
        createdInstance = pluginInstanceList[0];

        if (selectedPipeline) {
          const pipeline = pipelineData[selectedPipeline];
          if (
            pipeline.pluginPipings &&
            pipeline.pluginParameters &&
            pipeline.pipelinePlugins &&
            pipeline.pluginPipings.length > 0
          ) {
            const client = ChrisAPIClient.getClient();
            const {
              pluginPipings,
              pluginParameters,
              pipelinePlugins,
              computeEnvs,
            } = pipeline;
            const pluginDict: {
              [id: number]: number;
            } = {};

            for (let i = 0; i < pluginPipings.length; i++) {
              const currentPlugin = pluginPipings[i];

              const currentPluginParameter = pluginParameters.filter(
                (param: any) => {
                  if (currentPlugin.data.plugin_id === param.data.plugin_id) {
                    return param;
                  }
                }
              );

              const pluginFound = pipelinePlugins.find(
                (plugin) => currentPlugin.data.plugin_id === plugin.data.id
              );

              const data = currentPluginParameter.reduce(
                (
                  paramDict: {
                    [key: string]: string | boolean | number;
                  },
                  param: any
                ) => {
                  let value;

                  if (!param.data.value && param.data.type === "string") {
                    value = "";
                  } else {
                    value = param.data.value;
                  }
                  paramDict[param.data.param_name] = value;

                  return paramDict;
                },
                {}
              );

              let previous_id;
              if (i === 0) {
                previous_id = createdInstance.data.id;
              } else {
                const previousPlugin = pluginPipings.find(
                  (plugin) => currentPlugin.data.previous_id === plugin.data.id
                );
                previous_id = pluginDict[previousPlugin.data.plugin_id];
              }

              const computeEnv =
                computeEnvs &&
                computeEnvs[pluginFound.data.id] &&
                computeEnvs[pluginFound.data.id].currentlySelected;

              let finalData = {};
              if (computeEnv) {
                finalData = {
                  previous_id,
                  ...data,
                  compute_resource_name: computeEnv,
                };
              } else {
                finalData = {
                  previous_id,
                  ...data,
                };
              }

              const pluginInstance: PluginInstance =
                await client.createPluginInstance(
                  pluginFound.data.id,
                  //@ts-ignore
                  finalData
                );

              pluginDict[pluginInstance.data.plugin_id] =
                pluginInstance.data.id;
            }
          }
        }
      }

      statusCallback("Feed Created");

      feed = await createdInstance.getFeed();
    }
  } catch (error) {
    errorCallback(error as string);
  }

  return feed;
};

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void
) => {
  statusCallback("Unpacking parameters");

  let feed;
  if (selectedPlugin) {
    const pluginName = selectedPlugin.data.name;
    try {
      const fsPlugin = await getPlugin(pluginName);

      if (fsPlugin instanceof Plugin) {
        const data = await getRequiredObject(
          dropdownInput,
          requiredInput,
          fsPlugin
        );

        const pluginId = fsPlugin.data.id;
        statusCallback("Creating Plugin Instance");
        const client = ChrisAPIClient.getClient();
        try {
          const fsPluginInstance = await client.createPluginInstance(
            pluginId,
            //@ts-ignore
            data
          );
          feed = await fsPluginInstance.getFeed();
          statusCallback("Feed Created");
        } catch (error) {
          errorCallback(error as string);
        }
      }
    } catch (error) {
      errorCallback(error as string);
    }
  }
  return feed;
};

export const generatePathForLocalFile = (data: CreateFeedData) => {
  const randomCode = Math.floor(Math.random() * 100); // random 4-digit code, to minimize risk of folder already existing
  const normalizedFeedName = data.feedName
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/\//g, "");
  return `${normalizedFeedName}-upload-${randomCode}`;
};

export const uploadLocalFiles = async (
  files: LocalFile[],
  directory: string,
  statusCallback: (status: string) => void
) => {
  const client = ChrisAPIClient.getClient();
  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log("Directory", directory);
    const uploadedFile = await client.uploadFile(
      {
        upload_path: `${directory}/${file.name}`,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
    count = uploadedFile ? count + 1 : count;
    const percent = Math.round((count / files.length) * 20);

    if (
      !cache.includes(percent) &&
      (percent === 5 || percent === 10 || percent === 15 || percent === 20)
    ) {
      statusCallback(`Uploading Files To Cube (${count}/${files.length})`);
      cache.push(percent);
    }
  }
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
  selected?: PluginInstance
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
  const paginate = { limit: 30, offset: 0 };
  const fn = plugin.getPluginParameters;
  const boundFn = fn.bind(plugin);
  const params: PluginParameter[] = await fetchResource<PluginParameter>(
    paginate,
    boundFn
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
};
