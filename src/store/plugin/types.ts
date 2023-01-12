/*
 *  File:            plugin/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin calls
 *  Author:          ChRIS UI
 *  Notes:           .
 */
import keyMirror from "keymirror";
import { PluginParameter } from "@fnndsc/chrisapi";

export interface IPluginState {
  parameters?: PluginParameter[];
  computeEnv?: any[];
  nodeOperations: {
    [key: string]: boolean;
  };
}

export const PluginActionTypes = keyMirror({
  GET_PARAMS: null,
  GET_PARAMS_SUCCESS: null,
  GET_COMPUTE_ENV: null,
  GET_COMPUTE_ENV_SUCCESS: null,
  GET_NODE_OPERATIONS: null,
});
