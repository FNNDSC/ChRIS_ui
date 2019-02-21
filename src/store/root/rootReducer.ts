/*
 *   File:           rootReducer.ts
 *   Description:    this is where the Reducers comes together
 *   Author:         ChRIS ui Demo
 */
import { combineReducers } from 'redux';
import { ApplicationState } from './applicationState';

/// ADD ALL Local Reducers:
// import { ComponentReducer } from '../file-source';
import { uiReducer } from '../ui/reducer';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { messageReducer } from '../message/reducer';
import { feedReducer } from '../feed/reducer';
import { userReducer } from '../user/reducer';

export default (history: History) =>
  combineReducers({
    router: connectRouter(history),
    ui: uiReducer,
    message: messageReducer,
    feed: feedReducer,
    user: userReducer
    // rest of your reducers ...
  });
