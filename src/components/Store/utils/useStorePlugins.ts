// hooks/useStorePlugins.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import type { PluginsResponse } from "./types";

const LIMIT = 100;

/**
 * Fetch plugins from a specified store URL with infinite scrolling.
 */
export function useStorePlugins(
  selectedEnv: string,
  envOptions: Record<string, string>,
) {
  console.log("SelectedEnv", selectedEnv);

  return useInfiniteQuery({
    queryKey: ["storePluginsInfinite", selectedEnv],
    initialPageParam: { offset: 0 },
    enabled: !!selectedEnv,
    queryFn: async ({ pageParam = { offset: 0 } }) => {
      const baseUrl = envOptions[selectedEnv];
      const url = `${baseUrl}/?limit=${LIMIT}&offset=${pageParam.offset}`;
      const response = await axios.get<PluginsResponse>(url);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      const itemsSoFar = pages.reduce(
        (acc, page) => acc + page.results.length,
        0,
      );
      if (itemsSoFar < lastPage.count) {
        return { offset: itemsSoFar };
      }
      return undefined;
    },
  });
}
