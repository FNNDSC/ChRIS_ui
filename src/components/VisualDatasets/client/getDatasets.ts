import * as E from "fp-ts/Either";
import * as T from "fp-ts/Task";
import { Lazy, pipe } from "fp-ts/function";

import { Feed } from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp/chrisapi";

import constants from "./constants";
import problems from "./problems";
import { VisualDataset, GetDatasetsResult } from "../types";
import * as helpers from "./helpers";

/**
 * Contacts CUBE to search for datasets conformant to the "Visual Dataset"
 * conventions described here:
 *
 * https://chrisproject.org/docs/visual_dataset
 */
function getPublicVisualDatasets(client: FpClient): T.Task<GetDatasetsResult> {
  const searchParams = {
    files_fname_icontains: constants.MAGIC_DATASET_FILE,
    limit: constants.FEEDS_SEARCH_LIMIT,
  };
  return pipe(
    // 1. get all public feeds
    client.getPublicFeeds(searchParams),
    T.flatMap(
      E.match(
        // 2. if request for public feeds failed, return right away with error
        failedToGetPublicFeedsError,
        // 3. else, get all visual datasets within the returned feeds
        (feedsList) => {
          // 4. also show a warning if any feeds are missing due to lacking pagination
          const paginationWarnings = problems.checkFeedPageOverflow(feedsList);
          return pipe(
            getVisualDatasetsOfFeed(feedsList.getItems()!),
            T.map(({ datasets, errors }) => {
              return {
                datasets,
                errors: paginationWarnings.concat(errors),
              };
            }),
          );
        },
      ),
    ),
  );
}

/**
 * Query CUBE for visual datasets in feeds.
 */
function getVisualDatasetsOfFeed(feeds: Feed[]): T.Task<GetDatasetsResult> {
  const tasks = feeds.map((feed) => {
    // for each feed...
    return pipe(
      // 1. get all plugin instances in the feed.
      //    note: CUBE does not let us use search APIs if not logged in,
      //          so we have no choice but to get all plugin instances.
      FpClient.getPluginInstancesOf(feed, {
        limit: constants.PLUGININSTANCES_PER_FEED_LIMIT,
      }),
      T.map(
        E.match(
          // 2. if request for plugin instances fails, produce error
          failedToGetPluginInstancesOfFeedError(feed),
          // 3. else, get all visual datasets among the plugin instances
          (plinstList) => {
            return {
              // 4. also show a warning for plugin instances which were
              //    unaccounted for due to pagination not being implemented
              errors: problems.checkPluginInstancesPageOverflow(
                feed,
                plinstList,
              ),
              datasets: helpers
                .findVisualDatasetInstancePairs(plinstList.getItems()!)
                .map((plinsts): VisualDataset => {
                  // 5. add feed object to each plugin instance pair object
                  return { ...plinsts, feed };
                }),
            };
          },
        ),
      ),
    );
  });

  return pipe(
    // do requests for plugin instances in parallel
    T.sequenceArray(tasks),
    // since there are multiple feeds and multiple plugin instances per feed,
    // we need to flatten the result
    T.map(helpers.flattenVisualDatasetsReturn),
  );
}

function failedToGetPublicFeedsError(): ReturnType<
  typeof getPublicVisualDatasets
> {
  return T.of({
    errors: [problems.failedRequest("Could not get public feeds.")],
    datasets: [],
  });
}

function failedToGetPluginInstancesOfFeedError(
  feed: Feed,
): Lazy<GetDatasetsResult> {
  const title = `Could not get plugin instances of feed #${feed.data.id}`;
  return () => {
    return {
      errors: [problems.failedRequest(title)],
      datasets: [],
    };
  };
}

export { getPublicVisualDatasets };
