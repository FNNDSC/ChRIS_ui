import { IFeedFile } from "./feed-file.model";
import { IUITreeNode } from "./file-explorer.model";
import { getFileExtension } from "./file-explorer.model";
import ChrisModel from "./base.model";
import keyMirror from "keymirror";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  uiId: string;
  fileName: string;
  blobName?: string;
  blob?: Blob;
  blobText?: any;
  fileType?: string;
  isActive: boolean;
  index: number;
  error?: any;
}

// Description: Add all gallery related actions in this object
export const galleryActions = keyMirror({
  play: null,
  pause: null,
  next: null,
  previous: null,
  download: null,
  fullscreen: null,
  information: null,
});

export type galleryModelItemType = IUITreeNode | IGalleryItem;

export default class GalleryModel {
  static getGalleryItemBlob(galleryItem: IGalleryItem) {
    return ChrisModel.getFileBlob(galleryItem.url).catch((error) => {
      return { error }; // HANDLE ERROR FILES
    });
  }

  // Description: Find a gallery item by uiId
  static getGalleryItemIndex(
    uiId: string,
    galleryItems: galleryModelItemType[]
  ) {
    return _.findIndex(galleryItems, (item: galleryModelItemType) => {
      return _.isEqual(uiId, item.uiId);
    });
  }

  static getArrayItemIndex(url: string, urlArray: string[]) {
    const index = _.findIndex(urlArray, (itemUrl: string) => {
      return _.isEqual(url, itemUrl);
    });
    return index < 0 ? 0 : index;
  }

  // Description: is this a dcm file
  static isDicomFile(filename: string): boolean {
    switch (getFileExtension(filename).toLowerCase()) {
      case "dcm":
      case "dic":
      case "dicom":
        return true;
      default:
        return false;
    }
  }
}

export class GalleryListModel {
  galleryItems: IGalleryItem[] = [];
  constructor(selectedFile: IUITreeNode, selectedFolder: IUITreeNode) {
    this.galleryItems = this._buildGalleryArray(selectedFile, selectedFolder);
  }

  _buildGalleryArray(
    selectedFile: IUITreeNode,
    selectedFolder: IUITreeNode
  ): IGalleryItem[] {
    !!selectedFolder.children &&
      selectedFolder.children.map((node: IUITreeNode, index: number) => {
        const galleryItem = new GalleryItemModel(node, index).galleryItem;
        return this.galleryItems.push(galleryItem);
      });
    return this.galleryItems;
  }

  setGalleryItem(responses: any) {
    this.galleryItems = _.zipWith(
      this.galleryItems,
      responses,
      (galleryItem: IGalleryItem, response: any) => {
        const responseObj = !!response
          ? { blob: response }
          : { error: response, blob: null };
        return Object.assign({}, galleryItem, responseObj);
      }
    );
  }
}

export class GalleryItemModel {
  galleryItem: IGalleryItem;
  index: number;
  constructor(node: IUITreeNode, index: number = 0) {
    this.index = index;
    this.galleryItem = this._buildGalleryItem(node);
  }

  // Sets the blob and returns active item
  setGalleryItemBlob(response: any) {
    const responseObj = !!response
      ? { blob: response }
      : { error: response.error, blob: null };

    return Object.assign({}, this.galleryItem, responseObj); /// { ...this.galleryItem, responseObj };
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
      index: this.index,
    };

    return galleryItem;
  }
}
