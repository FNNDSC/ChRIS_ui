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
  blob?: Blob;
  blobText?: any;
  fileType?: string;
  isLoaded: boolean;
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
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[] = new Array();
  private _parentFolderNode?: IUITreeNode;

  constructor(node: IUITreeNode, explorer: IUITreeNode) {
    this.galleryItem = this._buildGalleryItem(node, node, 0);
    this._initActiveItem(node);
    this._buildGalleryArray(node, explorer);
  }
  _initActiveItem(node: IUITreeNode) {
    const fileUrl = node.file.file_resource;
    return FeedFileModel.getFileBlob(fileUrl).then((response: any) => {
      this.galleryItem.blob = response.data;
      this.galleryItem.isLoaded = true;
    });
  }

  // Description: build the galleryItems here
  _buildGalleryArray(node: IUITreeNode, explorer: IUITreeNode): IGalleryItem[] {
    this._findParentNode(node, explorer);
    if (!!this._parentFolderNode && !!this._parentFolderNode.children) {
      const _self = this;
      this._parentFolderNode.children.map(
        (subnode: IUITreeNode, index: number) => {
          const isActive = _.isEqual(subnode.file, node.file);
          const newItem = this._buildGalleryItem(subnode, node, index);
          if (!isActive) {
            const fileUrl = newItem.file_resource;
            FeedFileModel.getFileBlob(fileUrl).then((response: any) => {
              newItem.blob = response.data;
              newItem.isLoaded = true;
              _self.galleryItems.push(newItem);
            });
          } else {
            this.galleryItem.index = index;
            this.galleryItems.push(this.galleryItem);
          }
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
    const isActive = _.isEqual(node.file, active.file),
      fileType = getFileExtension(node.module);
    const galleryItem = {
      ...node.file,
      fileName: node.module,
      isActive,
      index,
      fileType,
      isLoaded: false
    };

    isActive && (this.galleryItem = galleryItem);
    return galleryItem;
  }
}
