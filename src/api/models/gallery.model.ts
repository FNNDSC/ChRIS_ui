import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import { getFileExtension } from "./file-explorer.model";
import FeedFileModel from "./feed-file.model";
import keyMirror from "keymirror";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  uiId: string;
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

export default class GalleryModel {
  static getGalleryItemBlob(galleryItem: IGalleryItem) {
    return FeedFileModel.getFileBlob(galleryItem.file_resource);
  }

  static getGalleryItemIndex(selectedFile: IUITreeNode, folderArray: IUITreeNode[]) {
    return _.findIndex(folderArray, (node: IUITreeNode) => {
         return _.isEqual(selectedFile, node)
    });
  }
 
}

export class GalleryListModel {
  galleryItems: IGalleryItem[] = new Array();
  constructor(selectedFile: IUITreeNode, selectedFolder: IUITreeNode) {
    this.galleryItems = this._buildGalleryArray(selectedFile, selectedFolder);
  }

  _buildGalleryArray(selectedFile: IUITreeNode, selectedFolder: IUITreeNode): IGalleryItem[] {
    !!selectedFolder.children &&
      selectedFolder.children.map((node: IUITreeNode, index: number) => {
        const galleryItem = new GalleryItemModel(node, index).galleryItem;
        this.galleryItems.push(galleryItem);
      });
    return this.galleryItems;
  }

  setGalleryItem(responses: any) {
    this.galleryItems = _.zipWith(this.galleryItems, responses, (galleryItem: IGalleryItem, response: any) => {
      return Object.assign({}, galleryItem, {blob: response.data});
    });
  }

}

export class GalleryItemModel {
  galleryItem: IGalleryItem;
  index: number;
  constructor(node: IUITreeNode, index: number= 0) {
    this.index = index;
    this.galleryItem = this._buildGalleryItem(node);
  }

  // Sets the blob and returns active item
  setGalleryItemBlob(data: Blob) {
    return {...this.galleryItem, blob: data  };
  }

  // Description: takes an explorer tree node and returns a gallery Item
  _buildGalleryItem(node: IUITreeNode): IGalleryItem {
    const fileType = getFileExtension(node.module);
    const galleryItem = {
      ...node.file,
      uiId: node.uiId,
      fileName: node.module,
      fileType,
      isActive: false,
      index: this.index
    };

    return galleryItem;
  }
}
