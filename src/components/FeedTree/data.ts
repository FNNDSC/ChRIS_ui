import {
  PipelinePipingDefaultParameterList,
  PluginInstance,
  PluginInstanceParameter,
  PluginParameter,
  PluginPiping,
} from "@fnndsc/chrisapi";
import { fetchResource } from "../../api/common";
import { TSID } from "./ParentComponent";

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

export default interface TreeNodeDatum extends Datum {
  children: TreeNodeDatum[];
  __rd3t: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

export interface Separation {
  siblings: number;
  nonSiblings: number;
}

export interface OwnProps {
  tsIds?: TSID;
  data: TreeNodeDatum[];
  onNodeClick: (node: any) => void;
  onNodeClickTs: (node: PluginInstance) => void;
  translate?: Point;
  scaleExtent: {
    min: number;
    max: number;
  };
  zoom: number;
  nodeSize: {
    x: number;
    y: number;
  };
  separation: Separation;
  changeOrientation: (orientation: string) => void;
}

export const getFeedTree = (items: PluginInstance[]) => {
  const tree = [];
  const mappedArr: {
    [key: string]: TreeNodeDatum;
  } = {};

  for (const item of items) {
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
  }

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
