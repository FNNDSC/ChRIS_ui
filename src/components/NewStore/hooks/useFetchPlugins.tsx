import type { Plugin as ApiPlugin } from "@fnndsc/chrisapi";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const LIMIT = 100;

export interface PluginsResponse {
  count: number;
  results: ApiPlugin[];
}

export type StorePlugin = ApiPlugin["data"] & {
  pluginsList: ApiPlugin[];
};

export const envOptions: Record<string, string> = {
  "PUBLIC ChRIS": "https://cube.chrisproject.org/api/v1/plugins",
  "NEW ChRIS": "http://chris.tch.harvard.edu:3223/api/v1/plugins",
  "STABLE ChRIS": "http://rc-live.tch.harvard.edu:32222/api/v1/plugins",
};

export function useFetchPlugins(
  selectedEnv: string,
  envOptions: Record<string, string>,
  searchTerm: string,
  searchField: string,
) {
  return useInfiniteQuery({
    queryKey: ["storePluginsInfinite", selectedEnv, searchTerm, searchField],
    initialPageParam: { offset: 0 },
    enabled: !!selectedEnv,
    queryFn: async ({ pageParam = { offset: 0 } }) => {
      const baseUrl = envOptions[selectedEnv];
      const url = `${baseUrl}/search/?limit=${LIMIT}&offset=${pageParam.offset}&${searchField}=${searchTerm}`;
      const response = await axios.get<PluginsResponse>(url);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      const itemsSoFar = pages.reduce(
        (acc, page) => acc + page.results.length,
        0,
      );
      return itemsSoFar < lastPage.count ? { offset: itemsSoFar } : undefined;
    },
  });
}

export const aggregatePlugins = (plugins: StorePlugin[]): StorePlugin[] => {
  const pluginMap: Record<string, StorePlugin> = {};

  plugins.forEach((plugin) => {
    const pluginName = plugin.name;
    if (!pluginMap[pluginName]) {
      pluginMap[pluginName] = { ...plugin, pluginsList: [plugin] };
    } else {
      pluginMap[pluginName].pluginsList?.push(plugin);
    }
  });

  return Object.values(pluginMap);
};
