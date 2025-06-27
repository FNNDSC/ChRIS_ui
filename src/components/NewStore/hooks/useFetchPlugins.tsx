import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Plugin as ApiPlugin } from "@fnndsc/chrisapi";

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
  // Map key ➜ “canonical” plugin (with list)
  const byName = new Map<string, StorePlugin>();

  for (const plugin of plugins) {
    const entry = byName.get(plugin.name);
    if (entry) {
      entry.pluginsList!.push(plugin);
    } else {
      byName.set(plugin.name, { ...plugin, pluginsList: [plugin] });
    }
  }

  return Array.from(byName.values());
};
