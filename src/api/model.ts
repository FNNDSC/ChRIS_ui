import _ from "lodash";
import type { FeedFile, PluginInstance } from "@fnndsc/chrisapi";

export interface IActionTypeParam {
  type: string;
  payload?: any;
  meta?: any;
  error?: any;
}

export type chrisId = number | string;

export type NodeId = chrisId | undefined;
export interface INode {
  // extends cola.Node extends SVGSVGElement
  id: number;
  item: PluginInstance;
  group?: number;
  isRoot?: boolean;
}

// Builds the webcola tree chart
export interface ITreeChart {
  nodes: INode[];
  links: ILink[];
  constraints?: IConstraint[];
  totalRows: number;
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

// Description: Parse Data from PluginInstance and convert to a ITreeChart
/*
 * Params: items = Pass the items array of nodes
 * rootNodeId = Root node id which indicates the root id
 */

export class TreeModel {
  treeChart: ITreeChart;
  constructor(items: PluginInstance[], rootNodeId?: NodeId) {
    this.treeChart = {
      nodes: [],
      links: [],
      totalRows: 0,
    };
    this.parseFeedTreeData(items, rootNodeId);
  }

  parseFeedTreeData(items: PluginInstance[], rootNodeId?: NodeId): ITreeChart {
    // Note: Reverse the array to expedite parsing also for demo purposes
    this._workingItems = items.reverse().slice();
    this._parseRootNode(items, rootNodeId);
    this._parseTreeChildren(this._workingItems, this._workingId);

    // Set the treeChart objects:
    this._setNodes(this._nodes);
    this._setLinks(this._links);
    this.treeChart.totalRows = this._totalRows;
    return this.treeChart;
  }

  // Working props for parsing
  private _workingIndex = 0;
  private _workingId: NodeId = 0;
  private _workingItems: PluginInstance[] = [];
  private _nodes: INode[] = [];
  private _links: ILink[] = [];
  private _totalRows = 0; // Counts the Max number of vertical nodes (for calculating height dynamically)
  // Description: Find the root of this tree:
  private _parseRootNode(items: PluginInstance[], rootNodeId: NodeId) {
    const parentItem = _.find(items, (item: PluginInstance) => {
      return item.data.previous_id === rootNodeId;
    });

    if (parentItem) {
      this._nodes.push({
        item: parentItem,
        id: this._workingIndex,
        group: 0,
        isRoot: true,
      });
      this._workingItems = this._removeWorkingItem(parentItem);
      this._workingId = parentItem.data.id;
      this._workingIndex++;
    }
    // Note: this is not the root or leaf plugin so increment the total rows
    this._totalRows++;
  }

  // Description: Recursive method to build tree
  private _parseTreeChildren(
    workingItems: PluginInstance[],
    _workingId: NodeId,
    _parentIndex = 0,
  ) {
    const cloneArr: PluginInstance[] = workingItems.slice();
    cloneArr.forEach((item: PluginInstance) => {
      if (item.data.previous_id === _workingId) {
        const id = this._workingIndex;
        // is this a child to the node we are working on?
        this._nodes.push({
          id,
          item,
          group: item.data.previous_id,
        });
        this._links.push({
          target: this._workingIndex,
          source: _parentIndex,
          value: 1,
        });
        this._workingItems = this._removeWorkingItem(item);
        this._workingIndex++;
        this._findChildrenNodes(item.data.id, id);
      }
    });
    workingItems.length > 0 && this._totalRows++; // Increment total rows for counting vertical levels
  }

  // Description: Find children to this node
  private _findChildrenNodes(id: NodeId, _parentIndex: number) {
    const workingChildrenArr = _.filter(
      this._workingItems,
      (subitem: PluginInstance) => {
        return id === subitem.data.previous_id;
      },
    );
    // Does this node have children - recur
    !!workingChildrenArr &&
      workingChildrenArr.length > 0 &&
      this._parseTreeChildren(workingChildrenArr, id, _parentIndex);
  }

  // Description: Remove item from working array
  private _removeWorkingItem(item: PluginInstance): PluginInstance[] {
    const arr = _.filter(this._workingItems, (subitem: PluginInstance) => {
      return item.data.id !== subitem.data.id;
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

export interface IFileBlob {
  blob?: Blob;
  file?: FeedFile;
  url?: string;
  fileType: string;
}

// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: {
  [key: string]: string;
} = {
  stats: "TextDisplay",
  txt: "TextDisplay",
  html: "IframeDisplay",
  pdf: "PdfDisplay",
  csv: "TextDisplay",
  ctab: "TextDisplay",
  json: "JsonDisplay",
  png: "DcmDisplay",
  jpg: "DcmDisplay",
  jpeg: "DcmDisplay",
  gif: "ImageDisplay",
  dcm: "DcmDisplay",
  default: "CatchallDisplay",
  nii: "NiiVueDisplay",
  gz: "CatchallDisplay",
  mgz: "NiiVueDisplay",
  fsm: "XtkDisplay",
  crv: "XtkDisplay",
  smoothwm: "XtkDisplay",
  pial: "XtkDisplay",
  "nii.gz": "NiiVueDisplay",
  mp4: "VideoDisplay", // Add mp4 format
  avi: "VideoDisplay", // Add avi format
  mov: "VideoDisplay", // Add mov format
  wmv: "VideoDisplay", // Add wmv format
  mkv: "VideoDisplay", // Add mkv format
};

// Description: get file type by file extension
export function getFileExtension(filename: string) {
  if (filename.endsWith(".nii.gz")) {
    return "nii.gz";
  }

  const name = filename.substring(filename.lastIndexOf(".") + 1);
  return name;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class FileViewerModel {
  public getFileName(item: FeedFile) {
    const splitString = item.data.fname.split("/");
    const filename = splitString[splitString.length - 1];
    return filename;
  }
}
