/*
 *   File:           rootReducer.ts
 *   Description:    this is where the Reducers comes together
 *   Author:         ChRIS UI
 */
import { combineReducers } from "redux";

/// ADD ALL Local Reducers:
// import { ComponentReducer } from '../file-source';
import { uiReducer } from "../ui/reducer";
import { messageReducer } from "../message/reducer";
import { feedsReducer } from "../feed/reducer";
import { pluginInstanceReducer } from "../pluginInstance/reducer";
import { resourceReducer } from "../resources/reducer";
import { userReducer } from "../user/reducer";
import { pluginReducer } from "../plugin/reducer";
import { explorerReducer } from "../explorer/reducer";
import { tsPluginsReducer } from "../tsplugins/reducer";
import { workflowsReducer } from "../workflows/reducer";


const rootReducer = combineReducers({
  ui: uiReducer,
  message: messageReducer,
  feed: feedsReducer,
  user: userReducer,
  plugin: pluginReducer,
  explorer: explorerReducer,
  instance: pluginInstanceReducer,
  resource: resourceReducer,
  tsPlugins: tsPluginsReducer,
  workflows: workflowsReducer,
});

export default rootReducer;
