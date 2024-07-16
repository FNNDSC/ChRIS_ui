import type { ICartState } from "../cart/types";
/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */
import type { IDrawerState } from "../drawer/types";
import type { IExplorerState } from "../explorer/types";
import type { IFeedState } from "../feed/types";
import type { IPluginState } from "../plugin/types";
import type { IPluginInstanceState } from "../pluginInstance/types";
import type { IResourceState } from "../resources/types";
import type { ITSPluginState } from "../tsplugins/types";
import type { IUiState } from "../ui/types";
import type { IUserState } from "../user/types";
import type rootReducer from "./rootReducer";

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
  cart: ICartState;
}

export type RootState = ReturnType<typeof rootReducer>;
