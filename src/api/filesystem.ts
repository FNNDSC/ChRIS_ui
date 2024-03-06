import ChrisAPIClient from "./chrisapiclient";
import { fetchResource } from "./common";

export const ls = async (path?: string) => {
  let folders: any[] = [];
  let files: any[] = [];
  if (!path) return { folders, files };

  try {
    const client = ChrisAPIClient.getClient();
    const uploads = await client.getFileBrowserPaths({
      path,
    });

    folders = uploads.data?.[0].subfolders
      ? JSON.parse(uploads.data[0].subfolders)
      : [];
    const pathList = await client.getFileBrowserPath(path);

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

export const find = async (space?: string | null, search?: string | null) => {
  const client = ChrisAPIClient.getClient();
  if (space === "feeds") {
    const payload = {
      limit: 10,
      offset: 0,
      files_fname_icontains: search,
    };
    const fn = client.getFeeds;
    const boundFn = fn.bind(client);
    const data = await fetchResource(payload, boundFn);
    return data;
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
