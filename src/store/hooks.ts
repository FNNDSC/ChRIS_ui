import { type TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "./root/applicationState";
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
import type { Feed, FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import ChrisAPIClient from "../api/chrisapiclient";
import { getFileName } from "../components/FeedOutputBrowser/FileBrowser";

export const createLinkAndDownload = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  //link.target = 'blank';
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPublicFile = async (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.data.fname);
  const url = file.collection.items[0].links[0].href;
  if (!url) {
    throw new Error("Failed to construct the URL");
  }
  createLinkAndDownload(url, fileName);
  return file;
};

export const downloadFile = async (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.data.fname);
  const client = ChrisAPIClient.getClient();
  const response = await client.createDownloadToken();
  const url = file.collection.items[0].links[0].href;
  if (!url) {
    throw new Error("Failed to construct the URL");
  }
  if (!response) {
    throw new Error("Failed to fetch the token...");
  }
  const token = response.data.token;
  const authorizedUrl = `${url}?download_token=${token}`; // Adjust token assignment
  createLinkAndDownload(authorizedUrl, fileName);
  return file;
};

const useDownload = (feed?: Feed) => {
  const handleDownload = async (file: FileBrowserFolderFile) => {
    try {
      if (feed?.data.public) {
        await downloadPublicFile(file);
      } else {
        await downloadFile(file);
      }
      return file;
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  const handleDownloadMutation = useMutation({
    mutationFn: (file: FileBrowserFolderFile) => handleDownload(file),
  });

  return handleDownloadMutation;
};

export default useDownload;
