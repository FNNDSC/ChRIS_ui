/**
 * Utils to be abstracted out
 */
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import _ from "lodash";

export function createTreeFromFiles(
  selected?: PluginInstance,
  files?: FeedFile[]
) {
  if (!files || !selected) return null;
  const filePaths = files.map((file) => {
    return {
      file: file,
      filePath: file.data.fname,
    };
  });

  let tree;

  buildTree(filePaths, (computedTree) => {
    tree = computedTree;
  });
  console.log("TREE", tree);

  return tree;
}

// Format plugin name to "Name_vVersion_ID"
export function getPluginName(plugin: PluginInstance) {
  const title = plugin.data.title || plugin.data.plugin_name;
  return title;
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance) {
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`;
}

const buildTree = (
  files: { file: FeedFile; filePath: string }[],
  cb: (tree: any[]) => void
) => {
  const tree: any[] = [];
  _.each(files, function (file) {
    const pathParts = file.filePath.split("/");
    pathParts.shift();
    let currentLevel = tree;
    _.each(pathParts, function (part) {
      const existingPath = _.find(currentLevel, {
        title: part,
      });
      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        const newPart = {
          title: part,
          file: file.file,
          children: [],
        };
        currentLevel.push(newPart);
        currentLevel = newPart.children;
      }
    });
  });

  cb(tree);
};
