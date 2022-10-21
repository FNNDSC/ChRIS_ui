import { action } from "typesafe-actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import { TSPluginTypes } from "./types";

export const addTSNodes = (node: PluginInstance) =>
  action(TSPluginTypes.ADD_TS_NODE, node);
export const deleteTsNode = (node: PluginInstance) =>
  action(TSPluginTypes.DELETE_TS_NODE, node);

export const switchTreeMode = (mode: boolean) =>
  action(TSPluginTypes.SWITCH_TREE_MODE, mode);


export const resetTsNodes = () => action(TSPluginTypes.RESET_TS_NODES);