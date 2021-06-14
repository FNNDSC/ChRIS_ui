import {
  RegistrationCheck,
  PluginList,
  DircopyData,
  FeedReturnPayload,
  PollStatus,
} from "../types";
import { v4 } from "uuid";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { setYieldAnalysis } from "../saga";
import { IActionTypeParam } from "../../../api/models/base.model";
import { PluginInstance, Plugin, Feed } from "@fnndsc/chrisapi";
import { LocalFile } from "../../../components/feed/CreateFeed/types";
import { getPlugin, uploadLocalFiles, uploadFilePaths } from "../../utils";
import { runGenericWorkflow, runFastSurferWorkflow } from "./workflows";
import { setFeedDetails } from "../actions";
import { put } from "@redux-saga/core/effects";

export function* checkPluginRegistration(pluginList: string[]) {
  const pluginRegistry: RegistrationCheck = {
    checkPassed: true,
    plugins: {},
  };
  for (let i = 0; i < pluginList.length; i++) {
    const { plugins } = pluginRegistry;
    const pluginNeeded = pluginList[i];

    const pluginFetched: Plugin = yield getPlugin(pluginNeeded);
    if (!pluginFetched) {
      pluginRegistry["checkPassed"] = false;
    }
    plugins[pluginNeeded] = pluginFetched;
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
  username: string
) {
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
    feedPayload["feed"] = feed;
    feedPayload["instance"] = dircopyInstance;
  } catch (error) {
    feedPayload["error"] = error;
  }

  return feedPayload;
}

export function* createFeed(
  pluginList: string[],
  localFiles: LocalFile[],
  username: string
) {
  yield setYieldAnalysis(1, "Plugins Registration Check", "process", "");
  const pluginRegistry: RegistrationCheck = yield checkPluginRegistration(
    pluginList
  );
  if (pluginRegistry.checkPassed) {
    yield setYieldAnalysis(1, "Registration Check Complete", "finish", "");
    const feedPayload: FeedReturnPayload = yield createFeedWithDircopy(
      pluginRegistry.plugins,
      localFiles,
      username
    );
    return {
      feedPayload,
      plugins: pluginRegistry.plugins,
    };
  } else {
    const errorCode = `Here are a list of plugins required ${pluginList.join(
      " , "
    )} `;
    setYieldAnalysis(1, "Registration Check Failed", "error", errorCode);
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
  yield setYieldAnalysis(4, "Finished Setup", "finish", "");
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
}

export function* setupFeedDetails(
  action: IActionTypeParam,
  pluginNames: string[],
  workflowType: string
) {
  yield setYieldAnalysis(2, "Creating a Feed", "process", "");
  const { localFiles, username } = action.payload;
  const { feedPayload, plugins } = yield createFeed(
    pluginNames,
    localFiles,
    username
  );
  const { feed, instance, error } = feedPayload;

  if (feed) {
    yield put(setFeedDetails(feed.data.id));
    yield setYieldAnalysis(2, "Feed Created", "finish", "");

    if (workflowType === "covidnet" || workflowType === "infant-freesurfer") {
      if (instance) {
        yield setYieldAnalysis(3, "Scheduling jobs", "process", "");
        const result: string = yield pollingBackend(instance);
        if (result === "finishedSuccessfully") {
          yield runGenericWorkflow(instance, plugins, workflowType);
        }
      }
    }
    if (workflowType === "adult-freesurfer") {
      yield setYieldAnalysis(3, "Scheduling jobs", "process", "");
      yield runFastSurferWorkflow(instance, plugins);
    }
    yield setYieldAnalysis(4, "Finished Scheduling", "finish", "");
  } else {
    yield setYieldAnalysis(2, "Cannot Run the Workflow", "error", `${error}`);
  }
}
