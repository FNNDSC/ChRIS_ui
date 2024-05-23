import ChrisAPIClient from "../../../api/chrisapiclient";
import axios from "axios";
import { useTypedSelector } from "../../../store/hooks";

const usePullStudyHook = () => {
  const userName = useTypedSelector((state) => state.user.username);
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}uploadedfiles/`;
  const client = ChrisAPIClient.getClient();
  const token = client.auth.token;

  const writeStatus = async (accessionNumber: string, type: boolean) => {
    // get existing status
    try {
      const status = await getStatus(accessionNumber);
      // delete this file
      await deleteFile(accessionNumber);
      // delete this file if it already exists
      const client = ChrisAPIClient.getClient();
      const path = `${userName}/uploads/pacs/${accessionNumber}`;
      const fileName = "pacsStatus.json";
      const formData = new FormData();

      const data = JSON.stringify({
        ...status,
        [accessionNumber]: type,
      });
      formData.append("upload_path", `${path}/${fileName}`);
      formData.append(
        "fname",
        new Blob([data], {
          type: "application/json",
        }),
      );

      const config = {
        headers: {
          Authorization: `Token ${client.auth.token}`,
        },
      };

      const response = await axios.post(url, formData, config);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deleteFile = async (accessionNumber: string) => {
    const file = await getFile(accessionNumber);
    if (file) {
      const url = file.url;
      await axios.delete(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    }
  };

  const getFile = async (accessionNumber: string) => {
    const client = ChrisAPIClient.getClient();
    const path = `${userName}/uploads/pacs/${accessionNumber}/pacsStatus.json`;
    const url = `${
      import.meta.env.VITE_CHRIS_UI_URL
    }uploadedfiles/search?fname_exact=${path}`;

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${client.auth.token}`,
        },
      });

      // If there is more than file don't write. Something has corrupted
      if (response.data.results.length <= 1) {
        const file = response.data.results[0];
        return file;
      }
      throw new Error("Failed to fetch the file...");
    } catch (error) {
      throw error;
    }
  };

  const getStatus = async (accessionNumber: string) => {
    try {
      const client = ChrisAPIClient.getClient();
      // Get this file first
      const file = await getFile(accessionNumber);
      if (file) {
        // file already exists;
        try {
          const response = await axios.get(file.file_resource, {
            headers: {
              "Content-Type": "blob",
              Authorization: `Token ${client.auth.token}`,
            },
          });

          if (response?.data) {
            return response.data;
          }
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    writeStatus,
    getStatus,
    deleteFile,
  };
};
export default usePullStudyHook;
