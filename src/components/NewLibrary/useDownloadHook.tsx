import { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getFileName } from "../FeedOutputBrowser/FileBrowser";

const useDownload = () => {
  const handleDownload = async (file: FileBrowserFolderFile) => {
    const fileName = getFileName(file.data.fname);
    try {
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
      const link = document.createElement("a");
      link.href = authorizedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.target = "blank";
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
