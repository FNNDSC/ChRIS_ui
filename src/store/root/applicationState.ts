/*
 *   File:           applicationState.ts
 *   Description:    this is where the ApplicationState and supporting interfaces comes together:
 *   Author:         ChRIS UI
 */

import { IUiState } from '../ui/types'
import { IMessageState } from '../message/types'
import { IUserState } from '../user/types'
import { IFeedState } from '../feed/types'
import { IPluginState } from '../plugin/types'
import { IExplorerState } from '../explorer/types'
import { IPluginInstanceState } from '../pluginInstance/types'
import rootReducer from './rootReducer'
import { IResourceState } from '../resources/types'
import { ITSPluginState } from '../tsplugins/types'

export interface ApplicationState {
  ui: IUiState
  message: IMessageState
  feed: IFeedState
  user: IUserState
  plugin: IPluginState
  explorer: IExplorerState
  instance: IPluginInstanceState
  resource: IResourceState
  tsPlugins: ITSPluginState
}

export type RootState = ReturnType<typeof rootReducer>
