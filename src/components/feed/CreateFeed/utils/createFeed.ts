import { unpackParametersIntoObject } from "../../AddNode/lib/utils";
import { CreateFeedData, LocalFile } from "../types/feed";
import { PipelineData } from "../types/pipeline";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { InputType } from "../../AddNode/types";
import { Plugin, PluginInstance, PluginParameter } from "@fnndsc/chrisapi";
import { fetchResource } from "../../../../api/common";

export function getName(selectedConfig: string) {
  if (selectedConfig === "fs_plugin") {
    return "Analysis Creation using an FS Plugin";
  } else if (selectedConfig === "file_select") {
    return "Analysis Creation using File Select";
  } else return "Analysis Creation";
}

export const createFeed = async (
  data: CreateFeedData,
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  username: string | null | undefined,
  pipelineData: PipelineData,
  setProgressCallback: (status: string, value: number) => void,
  setErrorCallback: (error: any) => void,
  selectedConfig: string,
  selectedPipeline?: number
) => {
  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed;
  setProgressCallback("Started", 20);

  if (selectedConfig === "local_select" || selectedConfig === "swift_storage") {
    feed = await createFeedInstanceWithDircopy(
      data,
      username,
      pipelineData,
      setProgressCallback,
      setErrorCallback,
      selectedConfig,
      selectedPipeline
    );
  } else if (selectedConfig === "fs_plugin") {
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
  statusCallback: (status: string, value: number) => void,
  errorCallback: (error: any) => void,
  selectedConfig: string,
  selectedPipeline?: number
) => {
  const { chrisFiles, localFiles } = data;

  let dirpath: string[] = [];
  let feed;

  if (selectedConfig === "swift_storage") {
    statusCallback("Compute Paths from swift storage", 40);
    dirpath = chrisFiles.map((path: string) => path);
  } else if (selectedConfig === "local_select") {
    statusCallback("Compute Paths from local file upload", 40);
    const generateUnique = generatePathForLocalFile(data);
    const path = `${username}/uploads/${generateUnique}`;
    const local_upload_path = localFiles.length > 1 ? `${path}/` : path;
    dirpath.push(local_upload_path);

    try {
      await uploadLocalFiles(localFiles, local_upload_path, statusCallback);
    } catch (error) {
      errorCallback(error as string);
    }
  }

  try {
    const client = ChrisAPIClient.getClient();
    const dircopy = await getPlugin("pl-dircopy");
    if (dircopy instanceof Plugin) {
      const createdInstance = await client.createPluginInstance(
        dircopy.data.id,
        {
          //@ts-ignore
          dir: dirpath.join(","),
        }
      );
      statusCallback("Creating Plugin Instance", 80);
      //when the `post` finishes, the dircopyInstances's internal collection is updated

      if (createdInstance) {
        if (selectedPipeline) {
          const pipeline = pipelineData[selectedPipeline];
          if (
            pipeline.pluginPipings &&
            pipeline.pluginParameters &&
            pipeline.pipelinePlugins &&
            pipeline.pluginPipings.length > 0
          ) {
            const { pluginParameters, input, computeEnvs } = pipeline;

            const nodes_info = client.computeWorkflowNodesInfo(
              //@ts-ignore
              pluginParameters.data
            );

            nodes_info.forEach((node) => {
              if (computeEnvs && computeEnvs[node["piping_id"]]) {
                const compute_node =
                  computeEnvs[node["piping_id"]]["currentlySelected"];

                const title =
                  pipeline.title && pipeline.title[node["piping_id"]];
                if (title) {
                  node.title = title;
                }
                if (compute_node) {
                  node.compute_resource_name = compute_node;
                }
              }
              const pluginParameterDefaults = [];
              if (input && input[node["piping_id"]]) {
                const { dropdownInput, requiredInput } =
                  input[node["piping_id"]];
                let totalInput = {};
                if (dropdownInput) {
                  totalInput = { ...totalInput, ...dropdownInput };
                }
                if (requiredInput) {
                  totalInput = { ...totalInput, ...requiredInput };
                }

                for (const i in totalInput) {
                  const parameter = dropdownInput[i];
                  const replaceValue = parameter["flag"].replace(/-/g, "");

                  pluginParameterDefaults.push({
                    name: replaceValue,
                    default: parameter["value"],
                  });
                }
                node["plugin_parameter_defaults"] = pluginParameterDefaults;
              }
            });

            await client.createWorkflow(selectedPipeline, {
              previous_plugin_inst_id: createdInstance.data.id,
              nodes_info: JSON.stringify(nodes_info),
            });
          }
        }
        statusCallback("Analysis Created", 90);
        feed = await createdInstance.getFeed();
      }
    }
  } catch (error) {
    errorCallback(error);
  }

  return feed;
};

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  statusCallback: (status: string, value: number) => void,
  errorCallback: (error: string) => void
) => {
  statusCallback("Unpacking parameters", 20);

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
        statusCallback("Creating Plugin Instance", 20);
        const client = ChrisAPIClient.getClient();
        try {
          const fsPluginInstance = await client.createPluginInstance(
            pluginId,
            //@ts-ignore
            data
          );
          feed = await fsPluginInstance.getFeed();
          statusCallback("Analysis Created", 20);
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

export const uploadLocalFiles = async (
  files: LocalFile[],
  directory: string,
  statusCallback: (status: string, value: number) => void
) => {
  const client = ChrisAPIClient.getClient();
  statusCallback(`Uploading Files To Cube`, 80);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const upload_path = `${directory}/${file.name}`;
    await client.uploadFile(
      {
        upload_path,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
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
  const { resource: params } = await fetchResource<PluginParameter>(
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

function generatePathForLocalFile(data: CreateFeedData) {
  const randomCode = Math.floor(Math.random() * 100);
  const normalizedFeedName = data.feedName
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/\//g, "");
  return `${normalizedFeedName}-upload-${randomCode}`;
}
