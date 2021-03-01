import ChrisAPIClient from "../../../../api/chrisapiclient";

export const getPlugins = async (
  name: string,
  limit: number,
  offset: number,
  type: string
) => {
  const client = ChrisAPIClient.getClient();
  const params = { name, limit, offset, type };
  const pluginList = await client.getPlugins(params);

  const plugins = pluginList.getItems();
  const totalCount = pluginList.totalCount;

  return {
    plugins,
    totalCount,
  };
};
