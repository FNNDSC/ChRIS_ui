import { DrawerPayloadType, IDrawerState } from "../../store/drawer/types";
import { setDrawerState } from "../../store/drawer/actions";
import type { Dispatch } from "redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { Feed, PublicFeedList, FeedList } from "@fnndsc/chrisapi";

export const handleDrawerActions = (
  actionType: string,
  open: boolean,
  maximized: boolean,
  minimized: boolean,
  dispatch: Dispatch,
  action: (action: DrawerPayloadType) => {
    type: any;
    payload: {
      actionType: string;
      open: boolean;
      maximized: boolean;
      minimized: boolean;
    };
  }
) => {
  dispatch(
    action({
      actionType,
      open,
      maximized,
      minimized,
    })
  );
};

export const handleMaximize = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, true, false, dispatch, setDrawerState);
};

export const handleMinimize = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, false, true, dispatch, setDrawerState);
};

export const handleOpen = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, false, false, dispatch, setDrawerState);
};

export const handleToggle = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: Dispatch
) => {
  handleDrawerActions(
    actionType,
    !drawerState[actionType].open,
    drawerState[actionType].maximized,
    false,
    dispatch,
    setDrawerState
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
  const client = ChrisAPIClient.getClient();
  const feed = await client.getFeed(+id);
  return feed;
}

export async function fetchPublicFeed(id?: string) {
  if (!id) return;
  const client = ChrisAPIClient.getClient();
  const publicFeed = await client.getPublicFeeds({ id: +id });

  //@ts-ignore
  if (publicFeed && publicFeed.getItems().length > 0) {
    //@ts-ignore
    return publicFeed.getItems()[0] as any as Feed;
  } else {
    return {};
  }
}
