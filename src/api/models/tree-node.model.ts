import { chrisId } from "./base.model";
import { PluginInstance } from "@fnndsc/chrisapi";
import _ from "lodash";

export type NodeId = chrisId | undefined;
export interface INode {
  // extends cola.Node extends SVGSVGElement
  item: PluginInstance;
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
  static isLeafNode(item: PluginInstance, items: PluginInstance[]) {
    // Find a node with previous_id  === item id
    return !!!_.find(items, (subitem: PluginInstance) => {
      return item.data.id === subitem.data.previous_id;
    });
  }

  // Description: determines if node is root
  static isRootNode(item: PluginInstance) {
    return !item.data.previous_id;
  }

  // Description: determines the total height depending on the number of rows / levels in the tree
  static calculateTotalTreeHeight(totalRows: number): number {
    const height = totalRows <= 1 ? 80 : Number(60 + (totalRows - 1) * 70);
    return height;
  }
}
