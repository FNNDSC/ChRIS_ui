import { PluginInstance, PluginParameter } from "@fnndsc/chrisapi";
import { fetchResource } from "../../../api/common";

export interface Datum {
  id?: number;
  name?: string;
  parentId?: number;
  item?: PluginInstance;
  children: Datum[];
}

export interface Point {
  x: number;
  y: number;
}

export interface TreeNodeDatum extends Datum {
  children: TreeNodeDatum[];
  __rd3t: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

export const getFeedTree = (items: PluginInstance[]) => {
  const tree = [],
    mappedArr: {
      [key: string]: TreeNodeDatum;
    } = {};

  items.forEach((item) => {
    const id = item.data.id;

    mappedArr[id] = {
      id: id,
      name: item.data.title || item.data.plugin_name,
      parentId: item.data.previous_id,
      item: item,
      children: [],
      __rd3t: {
        id: "",
        depth: 0,
        collapsed: false,
      },
    };
  });

  for (const id in mappedArr) {
    const mappedElem = mappedArr[id];
    if (mappedElem.parentId) {
      const parentId = mappedElem.parentId;
      if (parentId && mappedArr[parentId] && mappedArr[parentId].children)
        mappedArr[parentId].children.push(mappedElem);
    } else {
      tree.push(mappedElem);
    }
  }

  return tree;
};

export const getTsNodes = async (items: PluginInstance[]) => {
  const parentIds: {
    [key: string]: number[];
  } = {};
  const params = {
    limit: 20,
    offset: 0,
  };
  for (let i = 0; i < items.length; i++) {
    const instance = items[i];
    if (instance.data.plugin_type === "ts") {
      const fn = instance.getParameters;
      const boundFn = fn.bind(instance);
      const parameters: PluginParameter[] =
        await fetchResource<PluginParameter>(params, boundFn);
      parentIds[instance.data.id] = parameters[0].data.value
        .split(",")
        .map(Number);
    }
  }
  return parentIds;
};
