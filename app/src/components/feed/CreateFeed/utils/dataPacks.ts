import ChrisAPIClient from "../../../../api/chrisapiclient";
import { PluginMeta } from "@fnndsc/chrisapi";
import { fetchResource } from "../../../../api/common";

export const getPlugins = async (
  name: string,
  limit: number,
  offset: number,
  type: string
) => {
  const client = ChrisAPIClient.getClient();
  const params = { name, limit, offset, type };
  const fn = client.getPluginMetas;
  const boundFn = fn.bind(client);
  const { resource: plugins, totalCount } = await fetchResource<PluginMeta>(
    params,
    boundFn
  );

  return {
    plugins,
    totalCount,
  };
};
