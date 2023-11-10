/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */
import { IDrawerState } from "../drawer/types";
import { IExplorerState } from "../explorer/types";
import { IFeedState } from "../feed/types";
import { IPluginState } from "../plugin/types";
import { IPluginInstanceState } from "../pluginInstance/types";
import { IResourceState } from "../resources/types";
import { ITSPluginState } from "../tsplugins/types";
import { IUiState } from "../ui/types";
import { IUserState } from "../user/types";
import rootReducer from "./rootReducer";

export interface ApplicationState {
  ui: IUiState;
  feed: IFeedState;
  user: IUserState;
  plugin: IPluginState;
  instance: IPluginInstanceState;
  resource: IResourceState;
  tsPlugins: ITSPluginState;
  drawerState: IDrawerState;
  explorer: IExplorerState;
}

export type RootState = ReturnType<typeof rootReducer>;
