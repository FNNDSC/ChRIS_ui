import {IFeedFile} from "./feed-file.model";
import { IUITreeNode } from "./file-explorer";
import _ from "lodash";

export interface IGalleryItem extends IFeedFile {
  file_name: string;
}

// Description: handles gallery items
export default class GalleryModel {
  galleryItems: IGalleryItem[] = new Array();
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
    this.galleryItems.push(this._buildGalleryItem(this._node))
    this._findParentNode(this._node, this._explorer);
    return this.galleryItems;
  }

  // Description: Find the parent folder to the selected item
  _findParentNode(node: IUITreeNode, folderNode: IUITreeNode) {
      const fileMatch = _.find(folderNode.children, (obj: IUITreeNode) => {
        return (_.isEqual(obj.file, node.file));
      });

      // Iterate through Explorer children
      if (!!fileMatch) {
        this._parentFolderNode = folderNode;
      } else if (!!folderNode.children) {
        (folderNode.children).forEach((child: IUITreeNode) => {
          this._findParentNode(node, child);
        });
      }
  }

  // Description: takes an explorer tree node and returns a gallery Item
  _buildGalleryItem(node: IUITreeNode): IGalleryItem {
    return {
      ...node.file,
      file_name: node.module
    }
  }
}
