import {
  RegistrationCheck,
  PluginList,
  DircopyData,
  FeedReturnPayload,
  PollStatus,
  PluginReturnPayload,
} from "../types";
import { v4 } from "uuid";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { stopAnalysis } from "../actions";
import { setYieldAnalysis } from "../saga";
import { IActionTypeParam } from "../../../api/models/base.model";
import { PluginInstance, Feed, Note } from "@fnndsc/chrisapi";
import { LocalFile } from "../../../components/feed/CreateFeed/types";
import { getPlugin, uploadLocalFiles, uploadFilePaths } from "../../utils";
import {
  runGenericWorkflow,
  runAdultFreesurferWorkflow,
  runFastsurferWorkflow,
} from "./workflows";
import { setFeedDetails } from "../actions";
import { put } from "@redux-saga/core/effects";

export function* checkPluginRegistration(pluginList: string[]) {
  const pluginRegistry: RegistrationCheck = {
    checkPassed: true,
    plugins: {},
    error: "",
  };
  for (let i = 0; i < pluginList.length; i++) {
    const { plugins } = pluginRegistry;
    const pluginNeeded = pluginList[i];
    const pluginFetchPayload: PluginReturnPayload = yield getPlugin(
      pluginNeeded
    );
    const { error, plugin } = pluginFetchPayload;

    if (plugin) {
      plugins[pluginNeeded] = plugin;
    } else if (error) {
      pluginRegistry["error"] = error;
      pluginRegistry["checkPassed"] = false;
    }
  }

  return pluginRegistry;
}

export function* pollingBackend(instance: PluginInstance) {
  //@ts-ignore
  const instanceDetails = yield instance.get();
  const timeout = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  yield timeout(1000);
  const shouldWait = () => {
    const returnValue = ![
      PollStatus.CANCELLED,
      PollStatus.ERROR,
      PollStatus.SUCCESS,
    ].includes(instanceDetails.data.status);
    return returnValue;
  };
  while (shouldWait()) {
    yield timeout(6000);
    yield instance.get();
  }
  const result = instanceDetails.data.status;
  if (
    [PollStatus.CANCELLED, PollStatus.ERROR].includes(
      instanceDetails.data.status
    )
  ) {
  } else return result;
}

export function* createFeedWithDircopy(
  pluginList: PluginList,
  localFiles: LocalFile[],
  username: string,
  workflowType: string
) {
  yield setYieldAnalysis(2, "Creating a Feed Root Node", "process", "");
  const feedPayload: FeedReturnPayload = {
    feed: undefined,
    error: undefined,
    instance: undefined,
  };
  const client = ChrisAPIClient.getClient();
  const directoryName = `${username}/uploads/${v4()}`;
  yield uploadLocalFiles(localFiles, directoryName);
  const totalFilePaths: string[] = [];
  const filePaths = uploadFilePaths(localFiles, directoryName);
  totalFilePaths.push(filePaths);

  const data: DircopyData = {
    dir: totalFilePaths.join(","),
  };
  const dircopy = pluginList["pl-dircopy"];
  try {
    const dircopyInstance: PluginInstance = yield client.createPluginInstance(
      dircopy.data.id,
      data
    );
    const feed: Feed = yield dircopyInstance.getFeed();
    if (feed) {
      yield put(setFeedDetails(feed.data.id));
      yield setYieldAnalysis(2, "Created a Feed Root Node", "finish", "");
      const note: Note = yield feed.getNote();
      yield note.put({
        title: `${workflowType} analysis`,
        content: `Notes for your ${workflowType} analysis.`,
      });
      yield feed.put({
        name: `${workflowType} analysis`,
      });

      feedPayload["feed"] = feed;
    }

    feedPayload["instance"] = dircopyInstance;
  } catch (error) {
    feedPayload["error"] = error;
  }

  return feedPayload;
}

export function* createFeed(
  pluginList: string[],
  localFiles: LocalFile[],
  username: string,
  workflowType: string
) {
  yield setYieldAnalysis(1, "Plugins Registration Check", "process", "");
  const pluginRegistry: RegistrationCheck = yield checkPluginRegistration(
    pluginList
  );

  const checkPassed = pluginRegistry["checkPassed"];
  if (checkPassed === true) {
    yield setYieldAnalysis(1, "Registration Check Complete", "finish", "");
    const feedPayload: FeedReturnPayload = yield createFeedWithDircopy(
      pluginRegistry.plugins,
      localFiles,
      username,
      workflowType
    );
    return {
      feedPayload,
      plugins: pluginRegistry.plugins,
    };
  } else {
    const error = pluginRegistry["error"];
    const errorCode = `${error}. The required plugins for this workflow are ${pluginList.join(
      " , "
    )} `;
    yield setYieldAnalysis(1, "Registration Check Failed", "error", errorCode);
    yield put(stopAnalysis());
  }
}

type FeedFetch = {
  feedPayload: FeedReturnPayload;
  plugins: PluginList;
};

export function* setupFeedDetails(
  action: IActionTypeParam,
  pluginNames: string[],
  workflowType: string
) {
  const { localFiles, username } = action.payload;
  const feedFetch: FeedFetch = yield createFeed(
    pluginNames,
    localFiles,
    username,
    workflowType
  );

  if (feedFetch) {
    const { feedPayload, plugins } = feedFetch;
    const { feed, instance, error } = feedPayload;
    if (feed) {
      if (workflowType === "covidnet" || workflowType === "infant-freesurfer") {
        if (instance) {
          yield setYieldAnalysis(3, "Creating a Feed Tree", "process", "");
          const result: string = yield pollingBackend(instance);
          if (result === "finishedSuccessfully") {
            yield runGenericWorkflow(instance, plugins, workflowType);
          }
        }
      }
      if (workflowType === "adult-freesurfer") {
        yield setYieldAnalysis(3, "Creating a Feed Tree", "process", "");
        if (instance) yield runAdultFreesurferWorkflow(instance, plugins);
      }
      if (workflowType === "fastsurfer") {
        yield setYieldAnalysis(3, "Creating a Feed Tree", "process", "");
        if (instance) yield runFastsurferWorkflow(instance, plugins);
      }
    } else {
      yield put(stopAnalysis());
      yield setYieldAnalysis(
        3,
        "Cannot create a Feed Tree",
        "error",
        `${error}`
      );
    }
  }
}

export function* setupCovidnet(action: IActionTypeParam) {
  const covidnetPlugins: string[] = [
    "pl-dircopy",
    "pl-med2img",
    "pl-covidnet",
    "pl-pdfgeneration",
  ];
  yield setupFeedDetails(action, covidnetPlugins, "covidnet");
}

export function* setupInfantFreesurfer(action: IActionTypeParam) {
  const infantFreesurferPlugins = ["pl-dircopy", "pl-fshack-infant"];
  yield setupFeedDetails(action, infantFreesurferPlugins, "infant-freesurfer");
  yield setYieldAnalysis(4, "Success", "finish", "");
}

export function* setupAdultFreesurfer(action: IActionTypeParam) {
  const adultFreesurferPlugins: string[] = [
    "pl-dircopy",
    "pl-pfdicom_tagsub",
    "pl-pfdicom_tagextract",
    "pl-fshack",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2lut_report",
  ];
  yield setupFeedDetails(action, adultFreesurferPlugins, "adult-freesurfer");
  yield setYieldAnalysis(4, "Success", "finish", "");
}

export function* setupFastsurfer(action: IActionTypeParam) {
  const fastsurferPlugins = [
    "pl-dircopy",
    "pl-fshack",
    "pl-fastsurfer_inference",
    "pl-mgz2lut_report",
  ];
  yield setupFeedDetails(action, fastsurferPlugins, "fastsurfer");
  yield setYieldAnalysis(4, "Success", "finish", "");
}
