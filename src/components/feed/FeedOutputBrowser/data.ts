import { PluginInstance } from "@fnndsc/chrisapi";

export interface DataNode {
  children: DataNode[];
  isLeaf?: boolean;
  key: string | number;
  title?: React.ReactNode;
  item: PluginInstance;
  parentId?: number;
}

const firstElement = [];

export const getFeedTree = (items: PluginInstance[]) => {
  let tree = [],
    mappedArr: {
      [key: string]: DataNode;
    } = {};

  items.forEach((item) => {
    let id = item.data.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        key: id,
        title: item.data.plugin_name,
        parentId: item.data.previous_id,
        item: item,
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
        firstElement.push(mappedElem);
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};
