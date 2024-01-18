import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { PacsQueryContext } from "./context";

const useSettings = () => {
	async function fetchData(username: string) {
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
					const readPromise = new Promise((resolve) => {
						reader.onload = function (e) {
							const contents = JSON.parse(e.target.result);
							resolve(contents);
						};
					});

					reader.readAsText(blob);

					// Wait for the reader.onload to complete before moving to the next file
					return await readPromise;
				}),
			);

			return fileContents[0];
		} catch (error) {
			console.error("Error fetching file contents:", error);
			return null;
		}
	}

	const username = useTypedSelector((state) => state.user.username);

	const { isLoading, data, error } = useQuery({
		queryKey: ["metadata"],
		queryFn: async () => await fetchData(username),
	});

	return { data, isLoading, error };
};
export default useSettings;
