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
  username: string | null | undefined
) => {
  const { chrisFiles, localFiles, path } = data;

  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed;

  if (chrisFiles.length > 0 || localFiles.length > 0) {
    feed = await createFeedInstanceWithDircopy(data, path, username);
  } else if (dropdownInput || requiredInput) {
    feed = await createFeedInstanceWithFS(
      dropdownInput,
      requiredInput,
      selectedPlugin
    );
  }
  return feed;
};

export const createFeedInstanceWithDircopy = async (
  data: CreateFeedData,
  path: string,
  username: string | null | undefined
) => {
  const { chrisFiles, localFiles } = data;
  console.log();

  //chrisFiles receive a computed path from the fileBrowser
  console.log("ChRISFiles", chrisFiles);

  let dirpath = "";
  if (chrisFiles.length > 0) {
    dirpath = `${username}/${path}`;
  }

  //localFiles need to have their path computed

  if (localFiles.length > 0) {
    const local_upload_path = `${username}/uploads/${generatePathForLocalFile(
      data
    )}`;

    await uploadLocalFiles(localFiles, local_upload_path);
    dirpath = local_upload_path;
  }

  const dircopy = await getPlugin("dircopy");

  const dircopyInstance = await dircopy.getPluginInstances();
  await dircopyInstance.post({
    dir: dirpath,
  });



  //when the `post` finishes, the dircopyInstances's internal collection is updated
  let createdInstance = dircopyInstance.getItems()[0];

  const feed = await createdInstance.getFeed();
  console.log("CreatedInstance", createdInstance, feed);
  return feed;
};

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined
) => {
  let dropdownUnpacked;
  let requiredUnpacked;
  if (dropdownInput) {
    dropdownUnpacked = unpackParametersIntoObject(dropdownInput);
  }

  if (requiredInput) {
    requiredUnpacked = unpackParametersIntoObject(requiredInput);
  }
  let inputParameter = {
    ...dropdownUnpacked,
    ...requiredUnpacked,
  };

  if (selectedPlugin) {
    const pluginName = selectedPlugin.data.name;
    const fsPlugin = await getPlugin(pluginName);
    const fsPluginInstance = await fsPlugin.getPluginInstances();

    await fsPluginInstance.post({
      ...inputParameter,
    });

    const createdInstance = fsPluginInstance.getItems()[0];
    const feed = await createdInstance.getFeed();
    return feed;
  }
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
  console.log("Files to be uploaded", files);

  Promise.all(
    files.map(async (file: LocalFile) => {
      uploadedFiles.post(
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
