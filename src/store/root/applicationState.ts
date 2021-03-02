/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */


import { IUiState } from "../ui/types";
import { IMessageState } from "../message/types";
import { IUserState } from "../user/types";
import { IFeedState } from "../feed/types";
import { IPluginState } from "../plugin/types";
import { IExplorerState } from "../explorer/types";
import { IGalleryState } from "../gallery/types";
import rootReducer from "./rootReducer";

export interface ApplicationState {
  ui: IUiState;
  message: IMessageState;
  feed: IFeedState;
  user: IUserState;
  plugin: IPluginState;
  explorer: IExplorerState;
  gallery: IGalleryState;
}


export type RootState = ReturnType<typeof rootReducer>;




