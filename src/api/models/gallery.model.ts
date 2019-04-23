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
  isLoaded: boolean;
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

export default class GalleryModel {
  private _selectedFolder?: IUITreeNode;
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[] = new Array();
  constructor(node: IUITreeNode, selectedFolder: IUITreeNode) {
    this._selectedFolder = selectedFolder;
    this.galleryItem = this._buildGalleryItem(node, node, 0);
    this.galleryItems = this.buildGalleryArray(node,  selectedFolder);
  }

  buildGalleryArray(node: IUITreeNode, explorer: IUITreeNode): IGalleryItem[] {
    if (!!this. _selectedFolder && !!this. _selectedFolder.children) {
      this. _selectedFolder.children.map(
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
