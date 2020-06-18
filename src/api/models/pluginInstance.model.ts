import { PluginInstance } from "@fnndsc/chrisapi";

export const statusLabels: any = {
  finishedSuccessfully: "Finished Successfully",
  started: "Started",
  finishedWithError: "Finished With An Error",
  // Add more status strings as BE devs...
};

// Description: This will fix the title field for the UI demo - should be replaced with plugin name or title
// (!!plugin.title &&  plugin.title.length) ? plugin.title : plugin.plugin_name;
export function getPluginInstanceTitle(plugin: PluginInstance) {
  const title =
    plugin.data.plugin_name === "dircopy"
      ? "PACS Pull"
      : plugin.data.plugin_name === "freesurfer_pp"
      ? "Freesurfer"
      : !!plugin.data.title && plugin.data.title.length
      ? plugin.data.title
      : plugin.data.plugin_name;
  return title;
}

// Description: Similar to above  above, but works with new types and appends version.
export function getPluginInstanceDisplayName(plugin: PluginInstance) {
  const { plugin_name, plugin_version, title } = plugin.data;
  let finalTitle;
  if (plugin_name === "dircopy") {
    finalTitle = "PACS Pull";
  } else if (plugin_name === "freesurfer_pp") {
    finalTitle = "Freesurfer";
  } else {
    finalTitle = title && title.length ? title : plugin_name;
  }
  return `${finalTitle} v. ${plugin_version}`;
}
