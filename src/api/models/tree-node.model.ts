import { IPluginItem } from "./pluginInstance.model";
import * as _ from "lodash";


export type NodeId = number | string | undefined;
export interface INode {
  // extends cola.Node extends SVGSVGElement
  item: IPluginItem;
  index: number;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  bounds?: any;
  label?: string;
  isRoot?: boolean;
}



export default class TreeNodeModel {
  // Description: determines if node is leaf node
  static isLeafNode(item: IPluginItem, items: IPluginItem[]) {
    // Find a node with previous_id  === item id
    return !!!(_.find(items, (subitem: IPluginItem) => {
      return (item.id === subitem.previous_id);
    }));
  }

  // Description: determines if node is root
  static isRootNode(item: IPluginItem) {
    return !(!!item.previous_id && !!item.previous);
  }
}
