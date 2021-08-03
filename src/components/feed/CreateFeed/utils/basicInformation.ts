import { Tag } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../utils";
export const fetchTagList = async () => {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 30,
    offset: 0,
  };
  const resource: Tag[] = await fetchResource<Tag>(params, client.getTags);
  return resource;
};
