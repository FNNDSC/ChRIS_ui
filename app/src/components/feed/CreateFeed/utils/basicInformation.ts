import { Tag } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../api/common";
export const fetchTagList = async () => {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 30,
    offset: 0,
  };
  const fn = client.getTags;
  const boundFn = fn.bind(client);
  const { resource } = await fetchResource<Tag>(params, boundFn);
  return resource;
};
