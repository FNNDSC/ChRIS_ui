import ChrisAPIClient from "./chrisapiclient";
import { fetchResource } from "./common";

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
