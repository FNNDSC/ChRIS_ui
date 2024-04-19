import { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getFileName } from "../FeedOutputBrowser/FileBrowser";

const useDownload = () => {
  const handleDownload = async (file: FileBrowserFolderFile) => {
    const fileName = getFileName(file.data.fname);
    try {
      const client = ChrisAPIClient.getClient();
      const token = await client.createDownloadToken();
      const url = file.collection.items[0].links[0].href;
      if (!url) {
        throw new Error("Failed to construct the URL");
      }
      const authorizedUrl = `${url}?token=${token}`; // Adjust token assignment
      const link = document.createElement("a");
      link.href = authorizedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return file;
    } catch (e) {
      throw e;
    }
  };

  const handleDownloadMutation = useMutation({
    mutationFn: (file: FileBrowserFolderFile) => handleDownload(file),
  });

  return handleDownloadMutation;
};

export default useDownload;
