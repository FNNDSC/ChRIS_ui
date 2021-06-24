import { unpackParametersIntoObject } from "../../AddNode/lib/utils";
import { CreateFeedData, LocalFile } from "../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { InputType } from "../../AddNode/types";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { uploadFilePaths } from "../../../../store/workflows/utils";


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
  setProgressCallback: (status: string) => void,
  setErrorCallback: (error: string) => void
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
  username: string | null | undefined,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void
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
      errorCallback(error);
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
      errorCallback(error);
    }
    const filePaths = uploadFilePaths(localFiles, local_upload_path);

    dirpath.push(filePaths);
  }

  let feed;

  try {
    const dircopy = await getPlugin("pl-dircopy");
    const dircopyInstance = await dircopy.getPluginInstances();
    await dircopyInstance.post({
      dir: dirpath.join(","),
    });
    // clear global cache
    cache = [];
    statusCallback("Creating Plugin Instance");
    //when the `post` finishes, the dircopyInstances's internal collection is updated
    const createdInstance = dircopyInstance.getItems()[0];
    statusCallback("Feed Created");

    feed = await createdInstance.getFeed();
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
      const data = await getRequiredObject(
        dropdownInput,
        requiredInput,
        fsPlugin
      );

      const pluginId = fsPlugin.data.id;
      statusCallback("Creating Plugin Instance");
      const client = ChrisAPIClient.getClient();
      const fsPluginInstance = await client.createPluginInstance(
        pluginId,
        data
      );

      feed = await fsPluginInstance.getFeed();
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
  const client = ChrisAPIClient.getClient();
  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
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
  let paramList = await plugin.getPluginParameters(paginate);
  let params = paramList.getItems();
  while (paramList.hasNextPage) {
    try {
      paginate.offset += paginate.limit;
      paramList = await plugin.getPluginParameters(paginate);
      params = params.concat(paramList.getItems());
    } catch (error) {
      console.error(error);
    }
  }

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
      previous_id: selected.data.id,
    };
  } else {
    parameterInput = {
      ...mappedParameter,
    };
  }

  return parameterInput;
};
