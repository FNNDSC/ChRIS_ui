/*
 *   File:           rootReducer.ts
 *   Description:    this is where the Reducers comes together
 *   Author:         ChRIS UI
 */
import { combineReducers } from "redux";

import { uiReducer } from "../ui/reducer";
import { feedsReducer } from "../feed/reducer";
import { pluginInstanceReducer } from "../pluginInstance/reducer";
import { resourceReducer } from "../resources/reducer";
import { userReducer } from "../user/reducer";
import { pluginReducer } from "../plugin/reducer";
import { explorerReducer } from "../explorer/reducer";
import { tsPluginsReducer } from "../tsplugins/reducer";
import { drawerReducer } from "../drawer/reducer";

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
