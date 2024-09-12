import type {
  DrawerPayloadType,
  IDrawerState,
} from "../../store/drawer/drawerSlice";
import { setDrawerState } from "../../store/drawer/drawerSlice";

import type {
  Feed,
  FeedList,
  PluginInstance,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";

export const handleDrawerActions = (
  actionType: keyof IDrawerState,
  open: boolean,
  maximized: boolean,
  minimized: boolean,
  dispatch: any,
  action: (action: DrawerPayloadType) => {
    type: any;
    payload: {
      actionType: keyof IDrawerState;
      open: boolean;
      maximized: boolean;
      minimized: boolean;
    };
  },
) => {
  dispatch(
    action({
      actionType,
      open,
      maximized,
      minimized,
    }),
  );
};

export const handleMaximize = (
  actionType: keyof IDrawerState,
  dispatch: any,
) => {
  handleDrawerActions(actionType, true, true, false, dispatch, setDrawerState);
};

export const handleMinimize = (
  actionType: keyof IDrawerState,
  dispatch: any,
) => {
  handleDrawerActions(actionType, true, false, true, dispatch, setDrawerState);
};

export const handleOpen = (actionType: keyof IDrawerState, dispatch: any) => {
  handleDrawerActions(actionType, true, false, false, dispatch, setDrawerState);
};

export const handleToggle = (
  actionType: keyof IDrawerState,
  drawerState: IDrawerState,
  dispatch: any,
) => {
  handleDrawerActions(
    actionType,
    !drawerState[actionType].open,
    drawerState[actionType].maximized,
    false,
    dispatch,
    setDrawerState,
  );
};

export const fetchFeeds = async (filterState: any) => {
  const client = ChrisAPIClient.getClient();

  const feedsList: FeedList = await client.getFeeds({
    limit: +filterState.perPage,
    offset: filterState.perPage * (filterState.page - 1),
    [filterState.searchType]: filterState.search,
  });

  let feeds: Feed[] = [];

  if (feedsList.getItems()) {
    feeds = feedsList.getItems() as Feed[];
  }

  return {
    feeds,
    totalFeedsCount: feedsList.totalCount,
  };
};

export const fetchPublicFeeds = async (filterState: any) => {
  const offset = filterState.perPage * (filterState.page - 1);
  const client = ChrisAPIClient.getClient();

  const feedsList: PublicFeedList = await client.getPublicFeeds({
    limit: +filterState.perPage,
    offset,
    [filterState.searchType]: filterState.search,
  });

  let feeds: Feed[] = [];

  if (feedsList.getItems()) {
    feeds = feedsList.getItems() as Feed[];
  }

  return {
    feeds,
    totalFeedsCount: feedsList.totalCount,
  };
};

export async function fetchAuthenticatedFeed(id?: string) {
  if (!id) return;

  try {
    const client = ChrisAPIClient.getClient();
    const feed = await client.getFeed(+id);

    if (!feed) {
      throw new Error(
        "You do not permissions to view this feed. Redirecting...",
      );
    }
    return feed;
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw error;
  }
}

export async function fetchPublicFeed(id?: string) {
  if (!id) return;
  try {
    const client = ChrisAPIClient.getClient();
    const publicFeed = await client.getPublicFeeds({ id: +id });

    //@ts-ignore
    if (publicFeed && publicFeed.getItems().length > 0) {
      //@ts-ignore
      return publicFeed.getItems()[0] as any as Feed;
    }
    throw new Error("Failed to fetch this feed...");
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw error;
  }
}

type PluginInstanceStatus =
  | "cancelled"
  | "finishedWithError"
  | "waiting"
  | "scheduled"
  | "started"
  | "registeringFiles"
  | "finishedSuccessfully";

interface PluginInstanceDetails {
  size: number;
  progress: number;
  time: string;
  error: boolean;
  feedProgressText: string;
}

const LOOKUP: Record<PluginInstanceStatus, number> = {
  cancelled: 0,
  finishedWithError: 0,
  waiting: 1,
  scheduled: 2,
  started: 3,
  registeringFiles: 4,
  finishedSuccessfully: 5,
};

export const getPluginInstanceDetails = async (
  feed: Feed,
): Promise<PluginInstanceDetails> => {
  console.log("getplugininstace called");
  const details: PluginInstanceDetails = {
    size: 0,
    progress: 0,
    time: "",
    error: false,
    feedProgressText: "",
  };

  let totalSize = 0;
  let totalRunTime = 0;
  let error = false;
  let finishedCount = 0;
  let errorCount = 0;

  const params = { limit: 10000, offset: 0 };
  const fn = feed.getPluginInstances;
  const boundFn = fn.bind(feed);
  const { resource: pluginInstances }: { resource: PluginInstance[] } =
    await fetchResource(params, boundFn);

  const totalMilestones = pluginInstances.length * LOOKUP.finishedSuccessfully;
  let completedMilestones = 0;

  for (const pluginInstance of pluginInstances) {
    const startTime = new Date(pluginInstance.data.start_date).getTime();
    const endTime = new Date(pluginInstance.data.end_date).getTime();

    totalRunTime += endTime - startTime;
    totalSize += pluginInstance.data.size;

    const statusMilestone =
      LOOKUP[pluginInstance.data.status as PluginInstanceStatus];
    completedMilestones += statusMilestone;

    if (
      statusMilestone === LOOKUP.cancelled ||
      statusMilestone === LOOKUP.finishedWithError
    ) {
      error = true;
      errorCount += 1;
      continue; // Skip further checks for this instance
    }

    if (pluginInstance.data.status === "finishedSuccessfully") {
      finishedCount += 1;
    }
  }

  const feedProgressText = error
    ? `${errorCount}/${pluginInstances.length} jobs failed`
    : `${finishedCount}/${pluginInstances.length} jobs completed`;

  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  details.size = totalSize;
  details.progress = Math.floor(progressPercentage);
  details.time = convertMsToHM(totalRunTime);
  details.error = error;
  details.feedProgressText = feedProgressText;

  return details;
};
export const convertMsToHM = (milliseconds: number): string => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
};

export const padTo2Digits = (num: number): string => {
  return num.toString().padStart(2, "0");
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};
