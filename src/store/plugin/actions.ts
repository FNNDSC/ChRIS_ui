import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";

import { PluginParameter, Plugin } from "@fnndsc/chrisapi";

export const getParams = (plugin: Plugin) =>
  action(PluginActionTypes.GET_PARAMS, plugin);

export const getParamsSuccess = (params: {
  required: PluginParameter[];
  dropdown: PluginParameter[];
}) => action(PluginActionTypes.GET_PARAMS_SUCCESS, params);

export const getComputeEnv = (plugin: Plugin) =>
  action(PluginActionTypes.GET_COMPUTE_ENV, plugin);

export const getComputeEnvSuccess = (computeEnvs: any[]) =>
  action(PluginActionTypes.GET_COMPUTE_ENV_SUCCESS, computeEnvs);

export const getComputeEnvError = (error: any) =>
  action(PluginActionTypes.GET_COMPUTE_ENV_ERROR, error);

export const getNodeOperations = (opType: string) =>
  action(PluginActionTypes.GET_NODE_OPERATIONS, opType);
