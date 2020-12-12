import { createSelector } from "reselect";

const getPluginResource = (state) => state.feed.pluginInstanceResource;
const getSelected = (state) => state.feed.selectedPlugin;



export const getSelectedFiles = createSelector(
  [getPluginResource, getSelected],
  (pluginInstanceResource, selectedPlugin) => {
    const id = selectedPlugin && parseInt(selectedPlugin.data.id);
    return pluginInstanceResource && pluginInstanceResource[id] && pluginInstanceResource[id].files;
  }
);

