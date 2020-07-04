import { createSelector } from "reselect";

const getPluginFiles = (state) => state.plugin.pluginFiles;
const getSelected = (state) => state.feed.selected;

export const getSelectedFiles = createSelector(
  [getPluginFiles, getSelected],
  (pluginFiles, selected) => {
    const id = selected && parseInt(selected.data.id);
    return pluginFiles && pluginFiles[id];
  }
);
