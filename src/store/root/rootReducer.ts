/*
 *   File:           rootReducer.ts
 *   Description:    this is where the Reducers comes together
 *   Author:         ChRIS UI
 */
import { combineReducers } from "redux";

/// ADD ALL Local Reducers:
// import { ComponentReducer } from '../file-source';
import { uiReducer } from "../ui/reducer";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import { messageReducer } from "../message/reducer";
import { feedReducer } from "../feed/reducer";
import { userReducer } from "../user/reducer";
import { pluginReducer } from "../plugin/reducer";
import { explorerReducer } from "../explorer/reducer";
import { galleryReducer } from "../gallery/reducer";

export default (history: History) =>
  combineReducers({
    router: connectRouter(history),
    ui: uiReducer,
    message: messageReducer,
    feed: feedReducer,
    user: userReducer,
    plugin: pluginReducer,
    explorer: explorerReducer,
    gallery: galleryReducer,
  });
