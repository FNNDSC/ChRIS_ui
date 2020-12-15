import { createSelector } from "reselect";
import { ApplicationState } from "../../store/root/applicationState";

const getPluginFiles = (state: ApplicationState) => state.feed.pluginFiles;
const getSelected = (state: ApplicationState) => state.feed.selectedPlugin;

export const getSelectedFiles = createSelector(
  [getPluginFiles, getSelected],
  (pluginFiles, selectedPlugin) => {
    const id = selectedPlugin && selectedPlugin.data.id;
    return id && pluginFiles && pluginFiles[id] && pluginFiles[id].files;
  }
);
