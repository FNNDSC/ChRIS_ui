import { PluginInstance } from "@fnndsc/chrisapi";

export interface Datum {
  id?: number;
  name?: string;
  parentId?: number;
  item?: PluginInstance;
  children: Datum[];
}

export const getFeedTree = (items: PluginInstance[]) => {
  let tree = [],
    mappedArr: {
      [key: string]: Datum;
    } = {};

  items.forEach((item) => {
    let id = item.data.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        id: id,
        name: item.data.plugin_name,
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
        //@ts-ignore
        if (parentId) mappedArr[parentId].children.push(mappedElem);
      } else {
        tree.push(mappedElem);
      }
    }
  }
  return tree;
};
