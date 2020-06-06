import ChrisAPIClient from "../../../../api/chrisapiclient";

export const fetchTagList = async () => {
  const client = ChrisAPIClient.getClient();

  const params = { limit: 30, offset: 0 };
  let tagList = await client.getTags(params);
  const tags = tagList.getItems();

  while (tagList.hasNextPage) {
    try {
      params.offset += params.limit;
      tagList = await client.getTags(params);
      tags.push(...tagList.getItems());
    } catch (e) {
      console.error(e);
    }
  }
  return tags;
};
