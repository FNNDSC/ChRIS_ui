import { getFileExtension } from "./file-explorer.model";

import keyMirror from "keymirror";

export interface IGalleryItem {
  uiId: string;
  fileName: string;
  blob?: Blob;
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
  first: null,
  last: null,
  zoom: null,
  pan: null,
  wwwc: null,
  invert: null,
  magnify: null,
  rotate: null,
  stackScroll: null,
  dicomHeader: null,
  reset: null,
});

export default class GalleryModel {
  // Description: is this a dcm file
  static isValidDcmFile(filename: string): boolean {
    switch (getFileExtension(filename).toLowerCase()) {
      case "dcm":
      case "dic":
      case "dicom":
      case "png":
      case "jpg":
      case "jpeg":
      case "nii":
      case "gz":
        return true;
      default:
        return false;
    }
  }
  static isValidNiiFile(filename: string): boolean {
    const ext = getFileExtension(filename).toLowerCase();
    if (ext === "nii" || ext === "gz") {
      return true;
    } else return false;
  }
}
