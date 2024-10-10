import type {
  FileBrowserFolderFile,
  PACSFile,
  PluginInstance,
} from "@fnndsc/chrisapi";

export interface IActionTypeParam {
  type: string;
  payload?: any;
  meta?: any;
  error?: any;
}

export type IFileBlob = PACSFile | FileBrowserFolderFile;

export type chrisId = number | string;

export type NodeId = chrisId | undefined;
export interface INode {
  // extends cola.Node extends SVGSVGElement
  id: number;
  item: PluginInstance;
  group?: NodeId;
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
  private nodeMap: Map<NodeId, PluginInstance[]>;
  private _nodes: INode[] = [];
  private _links: ILink[] = [];
  private _totalRows = 0; // Counts the Max number of vertical nodes (for calculating height dynamically)
  private _workingIndex = 0;

  constructor(items: PluginInstance[]) {
    this.treeChart = {
      nodes: [],
      links: [],
      totalRows: 0,
    };
    this.nodeMap = this.buildNodeMap(items);
    this.parseFeedTreeData();
  }

  /**
   * Builds a map where each key is a parent NodeId and the value is an array of its children PluginInstances.
   * This allows O(1) access to children of any node, significantly improving time complexity.
   */
  private buildNodeMap(items: PluginInstance[]): Map<NodeId, PluginInstance[]> {
    const map = new Map<NodeId, PluginInstance[]>();
    items.forEach((item) => {
      const parentId = item.data.previous_id;
      if (!map.has(parentId)) {
        map.set(parentId, []);
      }
      map.get(parentId)!.push(item);
    });
    return map;
  }

  /**
   * Parses the tree data starting from the rootNodeId.
   * If no rootNodeId is provided, it assumes items without a parent are roots.
   */
  private parseFeedTreeData(): void {
    const roots = this.getRootNodes();

    roots.forEach((rootItem) => {
      this._nodes.push({
        id: this._workingIndex,
        item: rootItem,
        group: rootItem.data.previous_id,
        isRoot: true,
      });
      const currentNodeId = this._workingIndex;
      this._workingIndex++;
      this._totalRows++;

      this.buildTree(rootItem.data.id, currentNodeId, 1);
    });

    this.treeChart.nodes = this._nodes;
    this.treeChart.links = this._links;
    this.treeChart.totalRows = this._totalRows;
  }

  /**
   * Retrieves root nodes when no rootNodeId is provided.
   */
  private getRootNodes(): PluginInstance[] {
    // Assuming that a root node has a previous_id that is undefined or null
    return Array.from(this.nodeMap.keys()).includes(undefined as any) ||
      Array.from(this.nodeMap.keys()).includes(null as any)
      ? this.nodeMap.get(undefined as any) ||
          this.nodeMap.get(null as any) ||
          []
      : [];
  }

  /**
   * Recursively builds the tree by traversing the nodeMap.
   */
  private buildTree(
    parentId: NodeId,
    parentIndex: number,
    depth: number,
  ): void {
    const children = this.nodeMap.get(parentId);
    if (!children) return;

    children.forEach((child) => {
      const childId = this._workingIndex;
      this._nodes.push({
        id: childId,
        item: child,
        group: parentId,
      });
      this._links.push({
        source: parentIndex,
        target: childId,
        value: 1,
      });
      this._workingIndex++;
      this._totalRows = Math.max(this._totalRows, depth + 1);
      this.buildTree(child.data.id, childId, depth + 1);
    });
  }
}
// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: any = {
  stats: "TextDisplay",
  txt: "TextDisplay",
  html: "IframeDisplay",
  pdf: "PdfDisplay",
  csv: "TextDisplay",
  md: "TextDisplay",
  ctab: "TextDisplay",
  json: "JsonDisplay",
  png: "ImageDisplay",
  jpg: "ImageDisplay",
  jpeg: "ImageDisplay",
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

export class FileViewerModel {
  public getFileName(item: FileBrowserFolderFile) {
    const splitString = item.data.fname.split("/");
    const filename = splitString[splitString.length - 1];
    return filename;
  }
}
