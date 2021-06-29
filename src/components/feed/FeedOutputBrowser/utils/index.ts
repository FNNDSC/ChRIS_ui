/**
 * Utils to be abstracted out
 */
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import { each, find } from "lodash";
import { DataNode } from "../../../../store/explorer/types";

export function createTreeFromFiles(
  selected?: PluginInstance,
  files?: FeedFile[]
): DataNode[] | null {
  if (!files || !selected) return null;

  const filePaths = files.map((file) => {
    const filePath = file.data.fname.substring(
      file.data.fname.lastIndexOf(
        `${selected.data.plugin_name}_${selected.data.id}`
      ),
      file.data.fname.length
    );

    //@ts-ignore
    const fileSize = bytesToSize(file.data.fsize);
    return {
      file: file,
      filePath,
      fileSize,
    };
  });
  let tree = null;

  buildTree(filePaths, (computedTree) => {
    tree = computedTree;
  });

  return tree;
}

export function bytesToSize(bytes: number) {
  const sizes: string[] = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "N/A";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(0)} ${sizes[i]}`;
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
  files: { file: FeedFile; filePath: string; fileSize: string }[],
  cb: (tree: any[]) => void
) => {
  const tree: any[] = [];
  each(files, function (fileObj) {
    const pathParts = fileObj.filePath.split("/");
    pathParts.shift();
    let currentLevel = tree;
    each(pathParts, function (part) {
      const existingPath = find(currentLevel, {
        title: part,
      });
      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        const newPart = {
          key: `${part}_${fileObj.file.data.id}`,
          title: part,
          file: fileObj.file,
          fileSize: fileObj.fileSize,
          children: [],
        };
        currentLevel.push(newPart);
        currentLevel = newPart.children;
      }
    });
  });

  cb(tree);
};
