import { PluginInstance } from '@fnndsc/chrisapi'
import keyMirror from 'keymirror'

export interface ITSPluginState {
  tsNodes?: PluginInstance[]
  treeMode: boolean
}

export const TSPluginTypes = keyMirror({
  GET_FEED_TREE_PROP: null,
  SWITCH_TREE_MODE: null,
  ADD_TS_NODE: null,
  DELETE_TS_NODE: null,
  SET_LAYOUT: null,
  RESET_TS_NODES: null,
})
