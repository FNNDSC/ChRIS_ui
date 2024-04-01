import { useQuery } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";

const useSettings = () => {
  async function fetchData(username?: string | null) {
    const client = ChrisAPIClient.getClient();
    const path = `${username}/uploads/config`;
    const pathList = await client.getFileBrowserPath(path);

    if (!pathList) {
      return null;
    }

    const files = await pathList.getFiles();
    const fileItems = files.getItems();

    if (!fileItems) {
      return null;
    }

    try {
      // Use Promise.all to wait for all async operations to complete
      const fileContents = await Promise.all(
        fileItems.map(async (_file) => {
          const blob = await _file.getFileBlob();
          const reader = new FileReader();

          // Use a Promise to wait for the reader.onload to complete
          const readPromise = new Promise((resolve, reject) => {
            reader.onload = (e) => {
              try {
                const value = e.target ? e.target.result : ("{}" as any);
                const contents = JSON.parse(value);
                resolve(contents);
              } catch (parseError: any) {
                // Handle JSON parsing error
                reject(new Error(`Error parsing JSON: ${parseError.message}`));
              }
            };
          });

          reader.readAsText(blob);

          // Wait for the reader.onload to complete before moving to the next file
          return await readPromise;
        }),
      );

      return fileContents[0];
    } catch (error: any) {
      throw new Error(
        error.message || "An error occurred while processing files",
      );
    }
  }

  const username = useTypedSelector((state) => state.user.username);

  const {
    isLoading,
    data,
    error,
    isError,
  }: {
    isLoading: boolean;
    data?: {
      [key: string]: Record<string, boolean>;
    };
    error: any;
    isError: boolean;
  } = useQuery({
    queryKey: ["metadata"],
    queryFn: async () => await fetchData(username),
  });

  return { data, isLoading, error, isError };
};
export default useSettings;
