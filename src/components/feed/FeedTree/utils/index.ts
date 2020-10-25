import { PluginInstance } from "@fnndsc/chrisapi";

export type TreeType = {
  id: string;
  name: string;
  parentId: string | undefined;
  children: TreeType[];
};

export const getFeedTree = (items: TreeType[]) => {
  let tree = [],
    mappedArr: {
      [key: string]: TreeType;
    } = {};

  items.forEach((item) => {
    let id = item.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = item;
      mappedArr[id].children = [];
    }
  });

  for (let id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];

      if (mappedElem.parentId !== "undefined") {
        let parentId = mappedElem.parentId;
        if (parentId) mappedArr[parentId].children.push(mappedElem);
      } else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};

export const getTreeItems = (items: PluginInstance[]) => {
  return items.map((item) => {
    return {
      id: `${item.data.id}`,
      name: item.data.plugin_name,
      parentId: `${item.data.previous_id}`,
      children: [],
    };
  });
};
