/*
 *   File:           rootReducer.ts
 *   Description:    this is where the Reducers comes together
 *   Author:         ChRIS UI
 */
import { combineReducers } from "redux";

import { userReducer } from "../user/reducer";
import { uiReducer } from "../ui/reducer";
import { feedsReducer } from "../feed/reducer";
import { pluginReducer } from "../plugin/reducer";
import { pluginInstanceReducer } from "../pluginInstance/reducer";
import { resourceReducer } from "../resources/reducer";
import { drawerReducer } from "../drawer/reducer";
import { tsPluginsReducer } from "../tsplugins/reducer";
import { explorerReducer } from "../explorer/reducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  feed: feedsReducer,
  user: userReducer,
  plugin: pluginReducer,
  explorer: explorerReducer,
  instance: pluginInstanceReducer,
  resource: resourceReducer,
  tsPlugins: tsPluginsReducer,
  drawers: drawerReducer,
});

export default rootReducer;
