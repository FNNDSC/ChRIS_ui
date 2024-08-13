/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */

import type { Feed } from "@fnndsc/chrisapi";

export interface FeedPayload {
  data?: Feed;
  error: any;
  loading: boolean;
}

export interface FeedsResponsePayload {
  feeds: Feed[];
  totalCount: number;
}

export interface FeedTreeProp {
  orientation: "horizontal" | "vertical";
  translate: {
    x: number;
    y: number;
  };
}

export interface FeedResource {
  [id: string]: { details: any };
}

export interface IFeedState {
  currentFeed: FeedPayload;
  feedTreeProp: FeedTreeProp;
  currentLayout: boolean;

  searchFilter: {
    status: boolean;
    value: string;
  };
  showToolbar: boolean;
}
