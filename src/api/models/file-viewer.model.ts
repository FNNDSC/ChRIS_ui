import { FeedFile } from "@fnndsc/chrisapi";
import { AiOutlineFolderOpen, AiFillFile } from "react-icons/ai";
import { ImTree } from "react-icons/im";
import { TfiFlickr } from "react-icons/tfi";
import { FaTerminal, FaFileImage, FaBrain } from "react-icons/fa";
import { MdEditNote } from "react-icons/md";
import ChrisAPIClient from "../chrisapiclient";

export interface IFileBlob {
  blob?: Blob;
  file?: FeedFile;
  fileType: string;
}

export default class FileViewerModel {
  static downloadStatus: any = {};
  static itemsToDownload: FeedFile[] = [];
  static abortControllers: any = {};

  static getFileName(item: FeedFile) {
    const splitString = item.data.fname.split("/");
    const filename = splitString[splitString.length - 1];
    return filename;
  }

  static startDownload(
    item: FeedFile,
    notification: any,
    callback: (status: any) => void
  ) {
    const findItem = this.itemsToDownload.find(
      (currentItem) => currentItem.data.fname === item.data.fname
    );

    const filename = this.getFileName(item);
    const urlString = `${item.url}${filename}`;

    if (!findItem) {
      this.itemsToDownload.push(item);
      notification.info({
        message: `Preparing ${filename} for download.`,
        description: `Total Jobs (${this.itemsToDownload.length})`,
      });
      this.downloadFile(item, urlString, filename, notification, callback);
    }
  }

  static removeJobs(item: FeedFile, notification: any) {
    const index = this.itemsToDownload.indexOf(item);
    if (index > -1) {
      // only splice array when item is found
      this.itemsToDownload.splice(index, 1); // 2nd parameter means remove one item only
    }

    delete this.downloadStatus[item.data.fname];
    delete this.abortControllers[item.data.fname];
    const filename = this.getFileName(item);
    notification.info({
      message: `Cancelling download for ${filename}`,
      description: `Total jobs ${this.itemsToDownload.length}`,
      duration: 2,
    });
  }

  // Download File Blob
  static async downloadFile(
    item: FeedFile,
    urlString: string,
    filename: string,
    notification: any,
    callback: (status: any) => void
  ) {
    const client = ChrisAPIClient.getClient();
    const token = client.auth.token;

    const controller = new AbortController();
    const { signal } = controller;

    const downloadPromise = fetch(urlString, {
      method: "get",
      headers: {
        Authorization: `Token ${token}`,
      },
      signal,
    });

    const response = await downloadPromise;
    //@ts-ignore
    const reader = response.body.getReader();

    // Step 3: read the data
    let receivedLength = 0; // received that many bytes at the moment
    const chunks = []; // array of received binary chunks (comprises the body)
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      receivedLength += value.length;

      const percentCompleted = Math.floor(
        (receivedLength / item.data.fsize) * 100
      );

      this.downloadStatus = {
        ...this.downloadStatus,
        [item.data.fname]: percentCompleted,
      };

      this.abortControllers = {
        ...this.abortControllers,
        [item.data.fname]: controller,
      };

      callback(this.downloadStatus);
    }

  
    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    this.removeJobs(item, notification);
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
  brain: FaBrain,
  note: MdEditNote,
};
