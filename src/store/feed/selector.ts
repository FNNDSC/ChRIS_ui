import { createSelector } from "reselect";
import { ApplicationState } from "../../store/root/applicationState";

const getPluginFiles = (state: ApplicationState) => state.feed.pluginFiles;
export const getSelected = (state: ApplicationState) =>
  state.feed.selectedPlugin;
const getPluginInstanceResource = (state: ApplicationState) =>
  state.feed.pluginInstanceResource;

export const getPluginInstances=(state:ApplicationState)=>state.feed.pluginInstances

export const getSelectedFiles = createSelector(
  [getPluginFiles, getSelected],
  (pluginFiles, selectedPlugin) => {
    const id = selectedPlugin?.data.id;
    if (id) {
      return pluginFiles[id] && pluginFiles[id].files;
    } else return [];
  }
);

export const getSelectedInstanceResource = createSelector(
  [getPluginInstanceResource, getSelected],
  (pluginInstanceResource, selectedPlugin) => {
    const id = selectedPlugin && selectedPlugin.data.id;
    console.log("PlugiInstanceResource", pluginInstanceResource);
    if(id){
      return pluginInstanceResource && pluginInstanceResource[id] 
    }
    else return {} 
  }
);