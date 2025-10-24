import type {
  PipelinePipingDefaultParameterList,
  PluginInstance,
  PluginParameter,
  PluginPiping,
} from "@fnndsc/chrisapi";
import { fetchResource } from "../../api/common";

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
}

export interface Separation {
  siblings: number;
  nonSiblings: number;
}

export const getFeedTree = (items: PluginInstance[]) => {
  const tree: TreeNodeDatum[] = [];

  const mappedArr = new Map<number, TreeNodeDatum>();
  const childrenMap = new Map<number, TreeNodeDatum[]>();

  items.forEach((item) => {
    const id = item.data.id;
    const previous_id: number | null =
      item.data.previous_id !== undefined ? item.data.previous_id : null;
    const node: TreeNodeDatum = {
      id: id,
      name: item.data.title || item.data.plugin_name,
      parentId: item.data.previous_id,
      item: item,
      children: [],
    };
    mappedArr.set(id, node);
    if (previous_id !== null) {
      const parentNode = mappedArr.get(previous_id);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If parent hasn't been processed yet, store the child in childrenMap
        if (!childrenMap.has(previous_id)) {
          childrenMap.set(previous_id, []);
        }
        childrenMap.get(previous_id)!.push(node);
      }
    } else {
      tree.push(node);
    }

    if (childrenMap.has(id)) {
      // If there are children waiting for this node, add them
      const children = childrenMap.get(id)!;
      node.children.push(...children);
      childrenMap.delete(id);
    }
  });
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
      const { resource: parameters } = await fetchResource<PluginParameter>(
        params,
        boundFn,
      );
      const filteredParameters = parameters.filter(
        (param) => param.data.param_name === "plugininstances",
      );
      if (filteredParameters[0]) {
        parentIds[instance.data.id] = filteredParameters[0].data.value
          .split(",")
          .map(Number);
      }
    }
  }
  return parentIds;
};

export const getTsNodesWithPipings = async (
  items: PluginPiping[],
  pluginParameters?: PipelinePipingDefaultParameterList,
) => {
  const parentIds: {
    [key: string]: number[];
  } = {};

  for (let i = 0; i < items.length; i++) {
    const instance = items[i];

    if (instance.data.plugin_name === "pl-topologicalcopy") {
      //@ts-ignore
      pluginParameters.data
        .filter((param: any) => {
          return param.plugin_piping_id === instance.data.id;
        })
        .forEach((param: any) => {
          if (param.param_name === "plugininstances") {
            parentIds[param.plugin_piping_id] = param.value
              .split(",")
              .map(Number);
          }
        });
    }
  }
  return parentIds;
};
