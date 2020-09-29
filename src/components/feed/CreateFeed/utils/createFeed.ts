import { unpackParametersIntoObject } from "../../AddNode/lib/utils";
import { CreateFeedData, LocalFile } from "../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { InputType } from "../../AddNode/types";
import { Plugin, PluginInstance, PluginParameter } from "@fnndsc/chrisapi";

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
  setProgressCallback: (status: string) => void,
  setErrorCallback: (error: string) => void
) => {
  const { chrisFiles, localFiles, path } = data;

  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed;

  setProgressCallback("started");
  if (chrisFiles.length > 0 || localFiles.length > 0) {
    feed = await createFeedInstanceWithDircopy(
      data,
      path,
      username,
      setProgressCallback,
      setErrorCallback
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
  paths: string[],
  username: string | null | undefined,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void
) => {
  const { chrisFiles, localFiles } = data;

  //chrisFiles receive a computed path from the fileBrowser

  let dirpath: string[] = [];

  if (chrisFiles.length > 0) {
    statusCallback("Computing path for dircopy");
    dirpath = paths.map((path: string) => `${username}/${path}`);
  }

  //localFiles need to have their path computed
  if (localFiles.length > 0) {
    const local_upload_path = `${username}/uploads/${generatePathForLocalFile(
      data
    )}`;

    try {
      await uploadLocalFiles(localFiles, local_upload_path, statusCallback);
    } catch (error) {
      errorCallback(error);
    }
    dirpath.push(local_upload_path);
  }

  let feed;
  statusCallback("Creating Plugin Instance");
  try {
    const dircopy = await getPlugin("dircopy");
    const dircopyInstance = await dircopy.getPluginInstances();

    await dircopyInstance.post({
      dir: dirpath.join(","),
    });
    //when the `post` finishes, the dircopyInstances's internal collection is updated
    let createdInstance = dircopyInstance.getItems()[0];
    statusCallback("Creating Feed");
    feed = await createdInstance.getFeed();
    statusCallback("Feed Created");
  } catch (error) {
    errorCallback(error);
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
      let inputParameter = await getRequiredObject(
        dropdownInput,
        requiredInput,
        fsPlugin
      );
      const fsPluginInstance = await fsPlugin.getPluginInstances();
      statusCallback("Creating Plugin Instance");
      await fsPluginInstance.post({
        ...inputParameter,
      });

      const createdInstance = fsPluginInstance.getItems()[0];
      statusCallback("Created Feed Instance");
      feed = await createdInstance.getFeed();
      statusCallback("Feed Created");
    } catch (error) {
      errorCallback(error);
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
  let uploadedFiles = await ChrisAPIClient.getClient().getUploadedFiles();
  let count = 0;

  return Promise.all(
    files.map(async (file: LocalFile) => {
      const uploadedFile = await uploadedFiles.post(
        {
          upload_path: `${directory}/${file.name}`,
        },
        {
          fname: (file as LocalFile).blob,
        }
      );
      count = uploadedFile ? count + 1 : count;
      statusCallback(`Uploading Files To Cube (${count}/${files.length})`);
    })
  );
};

export const getPlugin = async (pluginName: string) => {
  const client = ChrisAPIClient.getClient();
  const pluginList = await client.getPlugins({
    name: pluginName,
  });
  const plugin = pluginList.getItems();

  return plugin[0];
};

export const getRequiredObject = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  plugin: Plugin,
  selected?: PluginInstance
) => {
  let dropdownUnpacked;
  let requiredUnpacked;
  let mappedParameter: {
    [key: string]: string;
  } = {};

  if (dropdownInput) {
    dropdownUnpacked = unpackParametersIntoObject(dropdownInput);
  }

  if (requiredInput) {
    requiredUnpacked = unpackParametersIntoObject(requiredInput);
  }

  let nodeParameter: {
    [key: string]: string;
  } = {
    ...dropdownUnpacked,
    ...requiredUnpacked,
  };

  const params = (await plugin.getPluginParameters())
    .getItems()
    .map((param: PluginParameter) => {
      return param.data;
    });

  for (let i = 0; i < params.length; i++) {
    if (Object.keys(nodeParameter).includes(params[i].flag)) {
      mappedParameter[params[i].name] = nodeParameter[params[i].flag];
    }
  }
  let parameterInput;
  if (selected) {
    parameterInput = {
      ...mappedParameter,
      previous_id: `${selected.data.id}`,
    };
  } else {
    parameterInput = {
      ...mappedParameter,
    };
  }

  return parameterInput;
};
