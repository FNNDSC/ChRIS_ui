import type { ICartState } from "../cart/types";
/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */
import type { IDrawerState } from "../drawer/drawerSlice";
import type { IExplorerState } from "../explorer/types";
import type { IFeedState } from "../feed/types";
import type { IPluginState } from "../plugin/pluginSlice";
import type { IPluginInstanceState } from "../pluginInstance/types";
import type { IResourceState } from "../resources/types";
import type { IUiState } from "../ui/uiSlice";
import type { IUserState } from "../user/userSlice";

export interface ApplicationState {
  ui: IUiState;
  feed: IFeedState;
  user: IUserState;
  plugin: IPluginState;
  instance: IPluginInstanceState;
  resource: IResourceState;
  drawers: IDrawerState;
  explorer: IExplorerState;
  cart: ICartState;
}

export type RootState = ApplicationState;
