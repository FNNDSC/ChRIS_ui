import ChrisAPIClient from "../../../../api/chrisapiclient";

export const getPlugins = async () => {
  const client = ChrisAPIClient.getClient();
  const params = { limit: 25, offset: 0 };
  let pluginList = await client.getPlugins(params);
  let plugins = pluginList.getItems();

  while (pluginList.hasNextPage) {
    try {
      params.offset += params.limit;
      pluginList = await client.getPlugins(params);
      plugins.push(...pluginList.getItems());
    } catch (e) {
      console.error(e);
    }
  }

  return plugins;
};
