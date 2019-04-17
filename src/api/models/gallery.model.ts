import { IUITreeNode } from "./file-explorer";

// Description: handles gallery items
export default class GalleryModel {
  static buildGalleryArray(node: IUITreeNode, explorer: IUITreeNode) {
    console.log("buildGalleryArray", node);
    const galleryArray = [node];
    return galleryArray;
  }
}
