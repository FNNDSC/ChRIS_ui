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
  const tree = [],
    mappedArr: {
      [key: string]: DataNode;
    } = {};

  items.forEach((item) => {
    const id = item.data.id;
    const title = item.data.title || item.data.plugin_name;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        key: id,
        title: `${title}`,
        parentId: item.data.previous_id,
        item: item,
        children: [],
      };
    }
  });

  for (const id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];

      if (mappedElem.parentId) {
        const parentId = mappedElem.parentId;
        if (parentId && mappedArr[parentId] && mappedArr[parentId].children)
          mappedArr[parentId].children.push(mappedElem);
      } else {
        firstElement.push(mappedElem);
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};
