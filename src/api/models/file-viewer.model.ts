import { FeedFile } from "@fnndsc/chrisapi";
import { AiOutlineFolderOpen, AiFillFile } from "react-icons/ai";
import { ImTree } from "react-icons/im";
import { TfiFlickr } from "react-icons/tfi";
import { FaTerminal, FaFileImage, FaBrain } from "react-icons/fa";
import { MdEditNote } from "react-icons/md";
import ChrisAPIClient from "../chrisapiclient";
import axios from "axios";

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

  static setDownloadStatus(status: number, item: FeedFile) {
    this.downloadStatus = {
      ...this.downloadStatus,
      [item.data.fname]: status,
    };
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

    const onDownloadProgress = (progress: any, item: FeedFile) => {
      const progressCalc = Math.floor(
        (progress.loaded / item.data.fsize) * 100
      );

      this.downloadStatus = {
        ...this.downloadStatus,
        [item.data.fname]: progressCalc,
      };
      callback(this.downloadStatus);
    };

    if (!findItem) {
      this.itemsToDownload.push(item);
      this.setDownloadStatus(0, item);
      callback(this.downloadStatus);
      notification.info({
        message: `Preparing ${filename} for download.`,
        description: `Total Jobs (${this.itemsToDownload.length})`,
        duration: 1,
      });

      this.downloadFile(
        item,
        filename,
        notification,
        callback,
        onDownloadProgress
      );
    }
  }

  static removeJobs(
    item: FeedFile,
    notification: any,
    callback: (status: any) => void,
    status: string
  ) {
    const index = this.itemsToDownload.indexOf(item);
    if (index > -1) {
      // only splice array when item is found
      this.itemsToDownload.splice(index, 1); // 2nd parameter means remove one item only
    }

    delete this.downloadStatus[item.data.fname];
    delete this.abortControllers[item.data.fname];
    const filename = this.getFileName(item);
    callback(this.downloadStatus);
    notification.info({
      message: `${status} download for ${filename}`,
      description: `Total jobs ${this.itemsToDownload.length}`,
      duration: 1.5,
    });
  }

  // Download File Blob
  static async downloadFile(
    item: FeedFile,
    filename: string,
    notification: any,
    callback: (status: any) => void,
    onDownloadProgressCallback: (progressEvent: number, item: FeedFile) => void
  ) {
    const urlString = `${item.url}${filename}`;
    const client = ChrisAPIClient.getClient();
    const token = client.auth.token;
    const controller = new AbortController();
    const { signal } = controller;

    this.abortControllers = {
      ...this.abortControllers,
      [item.data.fname]: controller,
    };

    const downloadPromise = axios
      .get(urlString, {
        responseType: "blob",
        headers: {
          Authorization: `Token ${token}`,
        },
        signal,
        onDownloadProgress: (progressEvent: number) => {
          onDownloadProgressCallback(progressEvent, item);
        },
      })
      .catch((error) => {
        this.removeJobs(item, notification, callback, error);
        return null;
      });

    const response = await downloadPromise;

    if (response && response.data) {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      setTimeout(function () {
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 1000);
      this.removeJobs(item, notification, callback, "Finished");
    }
  }
}

// Description: Mapping for Viewer type by file type *Note: Should come from db
// File type: Viewer component name
export const fileViewerMap: any = {
  stats: "TextDisplay",
  txt: "TextDisplay",
  html: "IframeDisplay",
  pdf: "PdfDisplay",
  csv: "TextDisplay",
  ctab: "TextDisplay",
  json: "JsonDisplay",
  png: "DcmDisplay",
  jpg: "DcmDisplay",
  jpeg: "DcmDisplay",
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
