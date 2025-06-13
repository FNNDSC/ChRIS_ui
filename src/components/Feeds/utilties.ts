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

export async function fetchAuthenticatedFeed(id: number) {
  if (!id) return;

  try {
    const client = ChrisAPIClient.getClient();
    const feed = await client.getFeed(id);

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

export async function fetchPublicFeed(id: number) {
  if (!id) return;
  try {
    const client = ChrisAPIClient.getClient();
    const publicFeed = await client.getPublicFeeds({ id });

    const items = publicFeed?.getItems();
    if (items && items.length > 0) {
      return items[0] as Feed;
    }
    throw new Error("Failed to fetch this feed...");
  } catch (error) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw error;
  }
}

export interface PluginInstanceDetails {
  progress: number;
  feedProgressText: string;
  isFinished?: boolean;
  foundError?: boolean;
}

export const getPluginInstanceDetails = (feed: Feed): PluginInstanceDetails => {
  const {
    created_jobs = 0,
    waiting_jobs = 0,
    scheduled_jobs = 0,
    started_jobs = 0,
    registering_jobs = 0,
    finished_jobs = 0,
    errored_jobs = 0,
    cancelled_jobs = 0,
  } = feed.data;

  // 1) Sum all jobs
  const totalJobs =
    created_jobs +
    waiting_jobs +
    scheduled_jobs +
    started_jobs +
    registering_jobs +
    finished_jobs +
    errored_jobs +
    cancelled_jobs;

  // 2) If no jobs at all => done, "No jobs"
  if (totalJobs === 0) {
    return {
      progress: 100,
      feedProgressText: "No jobs",
      isFinished: true,
      foundError: false,
    };
  }

  // 3) “Done” means finished, errored, or cancelled
  const doneJobs = finished_jobs + errored_jobs + cancelled_jobs;
  // 4) Calculate progress => % of jobs done
  const progress = Math.floor((doneJobs / totalJobs) * 100);

  // 5) Build feedProgressText
  let feedProgressText: string;
  if (errored_jobs > 0) {
    feedProgressText = `${errored_jobs}/${totalJobs} jobs failed`;
  } else {
    feedProgressText = `${finished_jobs}/${totalJobs} jobs completed`;
  }

  // 6) Flag if we have any errored OR cancelled jobs
  const foundError = errored_jobs > 0 || cancelled_jobs > 0;

  // 7) If doneJobs == totalJobs => feed is finished
  const isFinished = doneJobs === totalJobs;

  return {
    progress,
    feedProgressText,
    isFinished,
    foundError,
  };
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
