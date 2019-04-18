import {IFeedFile} from "./feed-file.model";
import { IUITreeNode } from "./file-explorer";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile{
  file_name: string;
}

// Description: handles gallery items
export default class GalleryModel {
  galleryItems: IGalleryItem[] = new Array();
  constructor(node: IUITreeNode, explorer: IUITreeNode) {
    this._buildGalleryArray(node, explorer);
  }


  _buildGalleryArray(node: IUITreeNode, explorer: IUITreeNode): IGalleryItem[] {
    this.galleryItems.push(this._buildGalleryItem(node))
    // build the galleryItems here
    return this.galleryItems;
  }

  _buildGalleryItem(node: IUITreeNode): IGalleryItem{
    return {
      ...node.file,
      file_name: node.module
    }
  }
}
