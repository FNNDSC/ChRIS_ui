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
import { messageReducer } from '../message/reducer';
import { feedReducer } from '../feed/reducer';
import { userReducer } from '../user/reducer';

const reducers = {
  // ... Register ALL reducers ... //
  ui: uiReducer,
  message: messageReducer,
  feed: feedReducer,
  user: userReducer

}
const rootReducer = combineReducers<ApplicationState>(reducers);

export default rootReducer;