import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import { getFileExtension } from "./file-explorer.model";
import FeedFileModel from "./feed-file.model";
import keyMirror from "keymirror";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  fileName: string;
  blob?: Blob;
  blobText?: any;
  fileType?: string;
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


export class GalleryListModel {
  galleryItems: IGalleryItem[] = new Array();
  constructor(selectedFile: IUITreeNode, selectedFolder: IUITreeNode) {
    this.galleryItems = this._buildGalleryArray(selectedFile, selectedFolder);
  }

  _buildGalleryArray(selectedFile: IUITreeNode, selectedFolder: IUITreeNode): IGalleryItem[] {
     (!!selectedFolder.children) &&
      selectedFolder.children.map(
        (node: IUITreeNode, index: number) => {
           const galleryItem = new GalleryItemModel(node).galleryItem;
           this.galleryItems.push(galleryItem);
        }
      );

     return this.galleryItems;
  }
}

export class GalleryItemModel {
  galleryItem: IGalleryItem;
  constructor(node: IUITreeNode) {
    this.galleryItem = this._buildGalleryItem(node);
  }
  // Description: takes an explorer tree node and returns a gallery Item
  _buildGalleryItem(node: IUITreeNode): IGalleryItem {
    const fileType = getFileExtension(node.module);
    const galleryItem = {
      ...node.file,
      fileName: node.module,
      fileType,
      isActive: false,
      index: null
    };
    return galleryItem;
  }

  // Sets the blob and returns active item
  setGalleryItemBlob(blob: Blob) {
    this.galleryItem.blob = blob;
    return this.galleryItem;
  }
}


export default class GalleryModel {
  private _selectedFolder?: IUITreeNode;
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[] = new Array();
  constructor(node: IUITreeNode, selectedFolder: IUITreeNode) {
    this._selectedFolder = selectedFolder;
    this.galleryItem = this._buildGalleryItem(node, node, 0);
    this.galleryItems = this.buildGalleryArray(node);
  }

  buildGalleryArray(node: IUITreeNode): IGalleryItem[] {
    if (!!this._selectedFolder && !!this._selectedFolder.children) {
      this._selectedFolder.children.map(
        (subnode: IUITreeNode, index: number) => {
          const newItem = this._buildGalleryItem(subnode, node, index);
          this.galleryItems.push(newItem);
        }
      );
    }
    return this.galleryItems;
  }

  setActiveGalleryItem(galleryItem: IGalleryItem) {
    return FeedFileModel.getFileBlob(galleryItem.file_resource);
  }

  // Sets the blob and returns active item
  setGalleryItemBlob(blob: Blob) {
    this.galleryItem.blob = blob;
    return this.galleryItem;
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
