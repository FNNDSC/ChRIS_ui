import { createSelector } from "reselect";

const getPluginFiles = state => state.plugin.pluginFiles;
const getSelected = state => state.plugin.selected;

export const getSelectedFiles = createSelector(
  [getPluginFiles, getSelected],
  (pluginFiles, selected) => {
    const id = selected && parseInt(selected.id);
    return pluginFiles && pluginFiles[id];
  }
);
