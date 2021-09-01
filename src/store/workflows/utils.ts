import { PluginInstance, PluginInstanceList, Plugin } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { PluginReturnPayload } from "./types";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import { fetchResource } from "../../utils";

export function* getPluginFiles(plugin: PluginInstance) {
  const params = { limit: 200, offset: 0 };
  const fn = plugin.getFiles;
  const boundFn = fn.bind(plugin);
  const files: any[] = yield fetchResource<any>(params, boundFn);
  return files;
}

export function* getPlugin(pluginName: string) {
  const pluginPayload: PluginReturnPayload = {
    plugin: undefined,
    error: "",
  };
  const client = ChrisAPIClient.getClient();
  const pluginLookup: PluginInstanceList = yield client.getPlugins({
    name_exact: pluginName,
  });
  let plugin: Plugin = {} as Plugin;
  if (pluginLookup.getItems()) {
    const pluginList: any[] = yield pluginLookup.getItems();
    plugin = pluginList[0];
  }

  if (!plugin) {
    pluginPayload["error"] = `${pluginName} is not registered`;
  } else pluginPayload["plugin"] = plugin;

  return pluginPayload;
}

export function* uploadLocalFiles(files: LocalFile[], directory: string) {
  const client = ChrisAPIClient.getClient();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    yield client.uploadFile(
      {
        upload_path: `${directory}/${file.name}`,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
  }
}

export function uploadFilePaths(files: LocalFile[], directory: string) {
  let localFilePath = "";
  if (files.length > 1) {
    localFilePath = directory;
  } else localFilePath = `${directory}/`;
  return localFilePath;
}
