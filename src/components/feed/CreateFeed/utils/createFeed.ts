import { unpackParametersIntoObject } from "../../AddNode/lib/utils";
import { CreateFeedData, LocalFile } from "../types";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { InputType } from "../../AddNode/types";
import { Plugin } from "@fnndsc/chrisapi";

export function getName(selectedConfig: string) {
  if (selectedConfig === "fs_plugin") {
    return "Feed Synthesis using FS Plugin";
  } else if (selectedConfig === "file_select") {
    return "Feed Synthesis using File Select";
  } else return "Feed Sythesis";
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
  path: string,
  username: string | null | undefined,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void
) => {
  const { chrisFiles, localFiles } = data;

  //chrisFiles receive a computed path from the fileBrowser

  let dirpath = "";
  if (chrisFiles.length > 0) {
    statusCallback("Computing path for dircopy");
    if (path.includes(username as string)) {
      dirpath = `${username}`;
    }

    dirpath = `${username}/${path}`;
  }

  //localFiles need to have their path computed
  if (localFiles.length > 0) {
    const local_upload_path = `${username}/uploads/${generatePathForLocalFile(
      data
    )}`;

    try {
      statusCallback("Uploading Files To Cube");
      await uploadLocalFiles(localFiles, local_upload_path);
    } catch (error) {
      errorCallback(error);
    }
    dirpath = local_upload_path;
  }

  let feed;
  statusCallback("Creating Plugin Instance");
  try {
    const dircopy = await getPlugin("dircopy");
    const dircopyInstance = await dircopy.getPluginInstances();
    await dircopyInstance.post({
      dir: dirpath,
    });
    //when the `post` finishes, the dircopyInstances's internal collection is updated
    let createdInstance = dircopyInstance.getItems()[0];
    statusCallback("Creating Feed");
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
  let dropdownUnpacked;
  let requiredUnpacked;
  if (dropdownInput) {
    dropdownUnpacked = unpackParametersIntoObject(dropdownInput);
  }

  if (requiredInput) {
    requiredUnpacked = unpackParametersIntoObject(requiredInput);
  }
  statusCallback("Unpacking parameters");
  let inputParameter = {
    ...dropdownUnpacked,
    ...requiredUnpacked,
  };

  let feed;
  if (selectedPlugin) {
    const pluginName = selectedPlugin.data.name;
    try {
      const fsPlugin = await getPlugin(pluginName);
      statusCallback("Creating Plugin Instance");
      const fsPluginInstance = await fsPlugin.getPluginInstances();

      await fsPluginInstance.post({
        ...inputParameter,
      });

      const createdInstance = fsPluginInstance.getItems()[0];
      statusCallback("Created Feed Instance");
      feed = await createdInstance.getFeed();
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
  directory: string
) => {
  let uploadedFiles = await ChrisAPIClient.getClient().getUploadedFiles();

  return Promise.all(
    files.map(async (file: LocalFile) => {
      await uploadedFiles.post(
        {
          upload_path: `${directory}/${file.name}`,
        },
        {
          fname: (file as LocalFile).blob,
        }
      );
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
