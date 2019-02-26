import * as cola from "webcola";
import { IPluginItem } from "./pluginInstance.model";
import * as _ from "lodash";

// Builds the webcola tree chart
export interface ITreeChart {
  nodes: INode[];
  links: ILink[];
  constraints?: IConstraint[];
}

export interface IConstraint {
  axis: string;
  left: number;
  right: number;
  gap: number;
}

export interface ILink {
  target: number;
  source: number;
  value: number;
}

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
}

// Description: Parse Data from IPluginItem and convert to a ITreeChart

export default class TreeModel {
  treeChart: ITreeChart;
  constructor(items: IPluginItem[]) {
    this.treeChart = {
      nodes: [],
      links: []
    };
    this.parseFeedTreeData(items)
  }

  parseFeedTreeData(items: IPluginItem[]): ITreeChart {
    // Note: Reverse the array to expedite parsing also for demo purposes
    this._workingItems = items.reverse().slice();
    this._parseRootNode(items);
    this._parseTreeChildren(this._workingItems, this._workingId);

    // Set the treeChart objects:
    this._setNodes(this._nodes);
    this._setLinks(this._links);
    return this.treeChart;
  }

  // Working props for parsing
  private _workingIndex: number = 0;
  private _workingId = 0;
  private _workingItems: IPluginItem[] = [];
  private _nodes: INode[] = [];
  private _links: ILink[] = [];
  // Description: Recursive method to build tree
  private _parseTreeChildren(
    workingItems: IPluginItem[],
    _workingId: number | string,
    _parentIndex: number = 0
  ) {
    const cloneArr: IPluginItem[] = workingItems.slice();
    cloneArr.forEach((item: IPluginItem) => {
      if (item.previous_id === _workingId) {
        const index = this._workingIndex;
        // is this a child to the node we are working on?
        this._nodes.push({
          item,
          index
        });
        this._links.push({
          target: this._workingIndex,
          source: _parentIndex,
          value: 1
        });
        this._workingItems = this._removeWorkingItem(item);
        this._workingIndex++;
        this._findChildrenNodes(item.id, index);
      }
    });
  }

  // Description: Find children to this node
  private _findChildrenNodes(id: number | string, _parentIndex: number) {
    const workingChildrenArr = _.filter(
      this._workingItems,
      (subitem: IPluginItem) => {
        return id === subitem.previous_id;
      }
    );
    // Does this node have children - recur
    !!workingChildrenArr &&
      workingChildrenArr.length > 0 &&
      this._parseTreeChildren(workingChildrenArr, id, _parentIndex);
  }

  // Find the root of this tree:
  private _parseRootNode(items: IPluginItem[]) {
    const parentItem = _.find(items, (item: IPluginItem) => {
      return item.previous === null && item.previous_id === undefined;
    });
    if (!!parentItem) {
      this._nodes.push({
        item: parentItem,
        index: this._workingIndex
      });
      this._workingItems = this._removeWorkingItem(parentItem);
      this._workingId = parentItem.id;
      this._workingIndex++;
    }
  }

  // Description: Remove item from working array
  private _removeWorkingItem(item: IPluginItem): IPluginItem[] {
    const arr = _.filter(this._workingItems, (subitem: IPluginItem) => {
      return item.id !== subitem.id;
    });
    return arr;
  }

  // Set the treeChart nodes array
  private _setNodes(nodes: INode[]) {
    this.treeChart.nodes = nodes;
  }

  // Set the treeChart links array
  private _setLinks(links: ILink[]) {
    this.treeChart.links = links;
  }
}
