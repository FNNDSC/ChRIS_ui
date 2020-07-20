import ChrisAPIClient from "../../../../api/chrisapiclient";

export const getPlugins = async (
  name: string,
  limit: number,
  offset: number,
  type: string
) => {
  const client = ChrisAPIClient.getClient();
  const params = { name, limit, offset, type };
  let pluginList = await client.getPlugins(params);

  let plugins = pluginList.getItems();
  let totalCount = pluginList.totalCount;

  return {
    plugins,
    totalCount,
  };
};
