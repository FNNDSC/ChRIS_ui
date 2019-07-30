import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import _ from "lodash";
export interface IFileBlob {
  blob?: Blob;
  blobName: string;
  blobText: any;
  fileType: string;
  file?: IFeedFile;
}

export default class FileViewerModel {
  static findParentFolder(
    node: IUITreeNode,
    explorer: IUITreeNode
  ) {
    this._findParentNode(node, explorer);
    return this._parentFolderNode;
  }
  static _parentFolderNode?: IUITreeNode;
  static _findParentNode(node: IUITreeNode, folderNode: IUITreeNode) {
    const fileMatch = _.find(folderNode.children, (obj: IUITreeNode) => {
      return _.isEqual(obj.file, node.file);
    });

    // Iterate through Explorer children
    if (!!fileMatch) {
      this._parentFolderNode = folderNode;
      return folderNode;
    } else if (!!folderNode.children) {
      folderNode.children.forEach((child: IUITreeNode) => {
        this._findParentNode(node, child);
      });
    }
  }

  // Download File Blob
  static downloadFile(Fileblob: any, fileName: string) {
    const url = window.URL.createObjectURL(new Blob([Fileblob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Description: Mapping for plugin tabs *Note: Should come from db
export const pluginViewerMap: any = {
  default: ["FileBrowserViewer"],
  dircopy: ["FileBrowserViewer", "RevViewer"],
  pacscopy: ["FileBrowserViewer", "RevViewer"],
  // mri10yr06mo01da_normal: ["RevViewer", "FileBrowserViewer"], // This is temp for custom display
  freesurfer_pp: [
    "FileBrowserViewer",
    "DicomViewer_2D",
    "DicomViewer_3D",
    "FreesurferDataTable",
  ],
  simpledsapp: [
    "FileBrowserViewer",
    "VolumeGrowth",
    "SegmentAnalysis",
    "ZScoreDataTable"
  ],
  mpcs: [
    "VolumeGrowth",
    "SegmentAnalysis",
    "ZScoreDataTable",
    "FileBrowserViewer"
  ],
  z2labelmap: ["ZScoreViewer", "FileBrowserViewer"]
};

// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: any = {
  stats: "IframeDisplay",
  txt: "IframeDisplay",
  html: "IframeDisplay",
  csv: "IframeDisplay",
  ctab: "IframeDisplay",
  json: "JsonDisplay",
  png: "ImageDisplay",
  jpg: "ImageDisplay",
  jpeg: "ImageDisplay",
  gif: "ImageDisplay",
  dcm: "DcmDisplay",
  default: "CatchallDisplay"
};
