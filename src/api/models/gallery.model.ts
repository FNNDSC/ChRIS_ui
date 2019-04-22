import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import { getFileExtension } from "./file-explorer.model";
import FeedFileModel from "./feed-file.model";
import keyMirror from "keymirror";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  fileName: string;
  isActive: boolean;
  index: number;
}

// Description: Add all gallery related actions in this object
export const galleryActions = keyMirror({
  play: null,
  pause: null,
  next: null,
  previous: null,
  download: null,
  fullscreen: null,
  information: null
});

// Description: handles gallery items
export default class GalleryModel {
  galleryItems: IGalleryItem[] = new Array();
  galleryItem?: IGalleryItem;
  private _node: IUITreeNode;
  private _explorer: IUITreeNode;
  private _parentFolderNode?: IUITreeNode;

  constructor(node: IUITreeNode, explorer: IUITreeNode) {
    this._node = node;
    this._explorer = explorer;
    this._buildGalleryArray();
  }

  // Description: build the galleryItems here
  _buildGalleryArray(): IGalleryItem[] {
    this._findParentNode(this._node, this._explorer);
    if (!!this._parentFolderNode && !!this._parentFolderNode.children) {
      this._parentFolderNode.children.map(
        (subnode: IUITreeNode, index: number) => {
          this.galleryItems.push(
            this._buildGalleryItem(subnode, this._node, index)
          );
        }
      );
    }
    return this.galleryItems;
  }

  // Description: Find the parent folder to the selected item
  _findParentNode(node: IUITreeNode, folderNode: IUITreeNode) {
    const fileMatch = _.find(folderNode.children, (obj: IUITreeNode) => {
      return _.isEqual(obj.file, node.file);
    });

    // Iterate through Explorer children
    if (!!fileMatch) {
      this._parentFolderNode = folderNode;
    } else if (!!folderNode.children) {
      folderNode.children.forEach((child: IUITreeNode) => {
        this._findParentNode(node, child);
      });
    }
  }

  // Description: takes an explorer tree node and returns a gallery Item
  _buildGalleryItem(
    node: IUITreeNode,
    active: IUITreeNode,
    index: number
  ): IGalleryItem {
    const isActive = _.isEqual(node.file, active.file);
    const galleryItem = {
      ...node.file,
      fileName: node.module,
      isActive,
      index
    };
    isActive && (this.galleryItem = galleryItem);
    return galleryItem;
  }
}
