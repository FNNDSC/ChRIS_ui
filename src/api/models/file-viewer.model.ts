import { FeedFile } from "@fnndsc/chrisapi";
import { AiOutlineFolderOpen, AiFillFile } from "react-icons/ai";
import { ImTree } from "react-icons/im";
import { TfiFlickr } from "react-icons/tfi";
import { FaTerminal, FaFileImage } from "react-icons/fa";

export interface IFileBlob {
  blob?: Blob;
  file?: FeedFile;
  fileType: string;
}

export default class FileViewerModel {
  // Download File Blob
  static downloadFile(Fileblob: any, fileName: string) {
    const url = window.URL.createObjectURL(new Blob([Fileblob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: any = {
  stats: "IframeDisplay",
  txt: "IframeDisplay",
  html: "IframeDisplay",
  pdf: "PdfDisplay",
  csv: "IframeDisplay",
  ctab: "IframeDisplay",
  json: "JsonDisplay",
  png: "ImageDisplay",
  jpg: "ImageDisplay",
  jpeg: "ImageDisplay",
  gif: "ImageDisplay",
  dcm: "DcmDisplay",
  default: "CatchallDisplay",
  nii: "NiftiDisplay",
  gz: "CatchallDisplay",
  mgz: "XtkDisplay",
  fsm: "XtkDisplay",
  crv: "XtkDisplay",
  smoothwm: "XtkDisplay",
  pial: "XtkDisplay",
};

export const iconMap: any = {
  graph: ImTree,
  preview: FaFileImage,
  directory: AiOutlineFolderOpen,
  files: AiFillFile,
  node: TfiFlickr,
  terminal: FaTerminal,
};
