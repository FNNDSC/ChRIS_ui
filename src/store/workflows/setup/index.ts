import ChrisAPIClient from "../../../api/chrisapiclient";
import { setYieldAnalysis } from "../saga";
import { setFeedDetails } from "../actions";
import { v4 } from "uuid";
import { LocalFile } from "../../../components/feed/CreateFeed/types";
import {
  Feed,
  Note,
  PluginInstance,
  PluginInstanceList,
} from "@fnndsc/chrisapi";
import { ComputeEnvData, DircopyData } from "../types";
import { put } from "@redux-saga/core/effects";


export function* createFeed(payload: any) {
  const { localFiles, username } = payload;
  yield setYieldAnalysis(
    1,
    "Creating a Feed Root Node",
    "process",
    `Uploading ${localFiles.length}`
  );

  const client = ChrisAPIClient.getClient();
  const directoryName = `${username}/uploads/${v4()}`;
  for (let i = 0; i < localFiles.length; i++) {
    const file = localFiles[i];
    yield client.uploadFile(
      {
        upload_path: `${directoryName}/${file.name}`,
      },
      {
        fname: (file as LocalFile).blob,
      }
    );
  }

  const filePath = [];
  if (localFiles.length > 1) {
    filePath.push(directoryName);
  } else {
    filePath.push(`${directoryName}/`);
  }

  const dircopyList: PluginInstanceList = yield client.getPlugins({
    name_exact: "pl-dircopy",
  });
  if (dircopyList.getItems()) {
    const pluginList: any[] = yield dircopyList.getItems();
    const dircopy = pluginList[0];
    const data: DircopyData = {
      dir: filePath.join(","),
    };
    const dircopyInstance: PluginInstance = yield client.createPluginInstance(
      dircopy.data.id,
      //@ts-ignore
      data
    );
    const feed: Feed = yield dircopyInstance.getFeed();
    if (feed) {
      yield put(setFeedDetails(feed.data.id));
      yield feed.put({
        name: `pipeline to workflow analysis`,
      });
      const note: Note = yield feed.getNote();
      yield note.put({
        title: `pipeline to workflow analysis`,
        content: `Notes for your analysis`,
      });
      yield setYieldAnalysis(1, "Created a Feed Root Node", "finish", "");
      return { dircopyInstance, feed };
    }
  }
}

export function* createFeedTree(
  parentNode: PluginInstance,
  pluginPipings: any[],
  pipelinePlugins: any[],
  pluginParameters: any[],
  computeEnvs: ComputeEnvData
) {
  const client = ChrisAPIClient.getClient();
  yield setYieldAnalysis(2, "Creating a Workflow", "process", "");

  const pluginDict: {
    [id: number]: number;
  } = {};

  for (let i = 0; i < pluginPipings.length; i++) {
    const currentPlugin = pluginPipings[i];

    const currentPluginParameter = pluginParameters.filter((param: any) => {
      if (currentPlugin.data.plugin_id === param.data.plugin_id) {
        return param;
      }
    });

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
      previous_id = parentNode.data.id;
    } else {
      const previousPlugin = pluginPipings.find(
        (plugin) => currentPlugin.data.previous_id === plugin.data.id
      );
      previous_id = pluginDict[previousPlugin.data.plugin_id];
    }

    const computeEnv = computeEnvs[pluginFound.data.name].currentlySelected;

    const finalData = {
      previous_id,
      compute_resource_name: computeEnv,
      ...data,
    };

    const pluginInstance: PluginInstance = yield client.createPluginInstance(
      pluginFound.data.id,
      //@ts-ignore
      finalData
    );

    pluginDict[pluginInstance.data.plugin_id] = pluginInstance.data.id;
  }

  yield setYieldAnalysis(2, "Created a Workflow", "finish", "");
}
