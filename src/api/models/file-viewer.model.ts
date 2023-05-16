import { FeedFile } from "@fnndsc/chrisapi";
import { AiOutlineFolderOpen, AiFillFile } from "react-icons/ai";
import { ImTree } from "react-icons/im";
import { TfiFlickr } from "react-icons/tfi";
import { FaTerminal, FaFileImage, FaBrain } from "react-icons/fa";
import { MdEditNote } from "react-icons/md";
import axios from "axios";
import ChrisAPIClient from "../chrisapiclient";

export interface IFileBlob {
  blob?: Blob;
  file?: FeedFile;
  fileType: string;
}

export default class FileViewerModel {
  // Download File Blob
  static async downloadFile(
    fileName: string,
    item?: FeedFile,
    callback?: (fname: string, percentCompleted: number) => void
  ) {
    const client = ChrisAPIClient.getClient();
    const token = client.auth.token;

    const splitString = fileName.split("/");
    const filename = splitString[splitString.length - 1];

    if (item) {
      const urlString = `${item.url}/${filename}`;

      const response = await fetch(urlString, {
        method: "get",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

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
        callback && callback(item.data.fname, percentCompleted);
      }

      // Step 4: concatenate chunks into single Uint8Array
      const chunksAll = new Uint8Array(receivedLength); // (4.1)
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position); // (4.2)
        position += chunk.length;
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
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
