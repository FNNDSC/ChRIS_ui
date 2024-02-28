import ChrisAPIClient from "../../api/chrisapiclient.ts";
import constants from "../../datasets/constants.ts";
import Client, { Feed, PluginInstance } from "@fnndsc/chrisapi";

type DatasetSearchResult = {
  warnings: string[];
  plinsts: PluginInstance[];
};

/**
 * Look for plugin instances containing visual datasets.
 *
 * If the user is not logged in, plugin instances are found within public feeds.
 *
 * This function is implemented inefficiently, and should be rewritten
 * after this backend issue is addressed:
 * https://github.com/FNNDSC/ChRIS_ultron_backEnd/issues/530
 */
async function getDatasets(
  feedName: string | undefined,
  isLoggedIn: boolean | undefined,
): Promise<DatasetSearchResult> {
  const warnings: string[] = [];
  const searchParams: Parameters<Client["getPublicFeeds"]>[0] = {
    files_fname_icontains: constants.MAGIC_DATASET_FILE,
    limit: constants.FEEDS_SEARCH_LIMIT,
  };
  if (feedName) {
    searchParams.name_exact = feedName;
  }

  const client = ChrisAPIClient.getClient();

  // Ultimately, what we want to search for are plugin instances.
  // However, plugin instances cannot be searched for directly
  // when the user is not logged in. They can only be searched
  // for by listing the plugin instances of feeds.
  // https://github.com/FNNDSC/ChRIS_ultron_backEnd/issues/530
  const feedCollection = isLoggedIn
    ? await client.getFeeds(searchParams)
    : await client.getPublicFeeds(searchParams);
  const feeds = feedCollection.getItems();
  if (feeds === null) {
    warnings.push(
      "This is a bug which I thought never happens, see https://github.com/FNNDSC/fnndsc/issues/101",
    );
    return { warnings, plinsts: [] };
  }

  const plinstPromises = feeds.map((feed: Feed) =>
    feed.getPluginInstances({
      limit: constants.PLUGININSTANCES_PER_FEED_LIMIT,
    }),
  );
  const plinstLists = await Promise.all(plinstPromises);
  const plinstNotPaginatedWarnings = plinstLists
    .filter(
      (plinstList) => plinstList.totalCount !== plinstList.getItems()?.length,
    )
    .map(
      (_, i) =>
        `Did not search all plugin instances in feed ${feeds[i].data.id}, pagination not implemented`,
    );
  warnings.push(...plinstNotPaginatedWarnings);
  const plinsts = plinstLists
    .flatMap((plinstList) => plinstList.getItems())
    .filter(isPlVisualDataset);
  return {
    warnings,
    plinsts,
  };
}

function isPlVisualDataset(plinst: PluginInstance): boolean {
  const { plugin_name, plugin_version } = plinst.data;
  return (
    plugin_name === "pl-visual-dataset" && isCompatibleVersion(plugin_version)
  );
}

function isCompatibleVersion(pluginVersion: string): boolean {
  return (
    constants.COMPATIBLE_PL_VISUAL_DATASET_VERSIONS.findIndex(
      (v) => v === pluginVersion,
    ) !== -1
  );
}

export { getDatasets, isPlVisualDataset };
export type { DatasetSearchResult };
