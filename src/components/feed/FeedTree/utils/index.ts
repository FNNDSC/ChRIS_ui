import { PluginInstance } from "@fnndsc/chrisapi";

export type TreeType = {
  id: string;
  name: string;
  parentId: string | undefined;
};




export const getFlattenedTree = (items: TreeType[]) => {
  let tree = [];

  tree = items.map((item) => {
    return {
      name: item.name,
      id: item.id,
      parentId: item.parentId === "undefined" ? "" : item.parentId,
    };
  });
  return tree;
};



export const getTreeItems = (items: PluginInstance[]) => {
  return items.map((item) => {
    return {
      id: `${item.data.id}`,
      name: item.data.plugin_name,
      parentId: `${item.data.previous_id}`,
    };
  });
};
