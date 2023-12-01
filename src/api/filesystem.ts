import ChrisAPIClient from "./chrisapiclient";
import { fetchResource } from "./common";

export const ls = async (path?: string) => {
	let folders = [];
	let files = [];
	if (!path) return { folders, files };

	try {
		const client = ChrisAPIClient.getClient();
		const uploads = await client.getFileBrowserPaths({
			path,
		});


		folders =
			uploads.data && uploads.data[0].subfolders
				? JSON.parse(uploads.data[0].subfolders)
				: [];
		const pathList = await client.getFileBrowserPath(path);

		let files = [];
		if (pathList) {
			const pagination = {
				limit: 100,
				offset: 0,
			};
			const fn = pathList.getFiles;
			const boundFn = fn.bind(pathList);
			const data = await fetchResource(pagination, boundFn);
			files = data.resource;
		}
		return { folders, files };
	} catch (error) {
		return { folders, files };
	}
};

export const mkdir = (path: string) => {
	console.log("Directory");
};

export const find = async (space: string, search: string) => {
	const client = ChrisAPIClient.getClient();
	if (space === "feeds") {
		const payload = {
			limit: 10,
			offset: 0,
			files_fname_icontains: search,
		};
		const fn = client.getFeeds;
		const boundFn = fn.bind(client);
		return await fetchResource(payload, boundFn);
	}

	if (space === "pacs") {
		const payload = {
			limit: 10,
			offset: 0,
			fname_icontains_topdir_unique: search,
		};
		const fn = client.getPACSFiles;
		const boundFn = fn.bind(client);
		return await fetchResource(payload, boundFn);
	}
};



