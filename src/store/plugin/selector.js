import { createSelector } from "reselect";

const getPluginFiles = (state) => state.plugin.pluginFiles;
const getSelected = (state) => state.feed.selectedPlugin;

export const getSelectedFiles = createSelector(
  [getPluginFiles, getSelected],
  (pluginFiles, selectedPlugin) => {
    const id = selectedPlugin && parseInt(selectedPlugin.data.id);
    return pluginFiles && pluginFiles[id];
  }
);
