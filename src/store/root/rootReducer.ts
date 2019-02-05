/*
*   File:           rootReducer.ts
*   Description:    this is where the Reducers comes together
*   Author:         ChRIS ui Demo
*/
import { combineReducers } from 'redux';
import { ApplicationState } from './applicationState';

/// ADD ALL Local Reducers:

// import { ComponentReducer } from '../file-source';


const reducers = {
  // ... Register ALL reducers ...
  component: (state:any) => { return {};} // TEMP Placeholder for local reducers ***** to be done
  
}
const rootReducer = combineReducers<ApplicationState>(reducers);

export default rootReducer;