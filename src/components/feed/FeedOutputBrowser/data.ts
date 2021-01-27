import { PluginInstance } from "@fnndsc/chrisapi";

export interface TreeViewDataItem {
  name: React.ReactNode;
  id?: string;
  children: TreeViewDataItem[];
  defaultExpanded?: boolean;
  parentId?: number;
}

export const getFeedTree = (items: PluginInstance[]) => {
  let tree = [],
    mappedArr: {
      [key: string]: TreeViewDataItem;
    } = {};

  items.forEach((item) => {
    let id = item.data.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        id: `${id}`,
        name: item.data.plugin_name + `_${id}`,
        parentId: item.data.previous_id,
        children: [],
      };
    }
  });

  for (let id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];

      if (mappedElem.parentId) {
        let parentId = mappedElem.parentId;
        if (parentId) mappedArr[parentId].children.push(mappedElem);
      } else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};
