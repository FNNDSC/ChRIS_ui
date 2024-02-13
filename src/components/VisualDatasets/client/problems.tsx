import { Problem, VisualDataset } from "../types.ts";
import {
  Feed,
  FeedPluginInstanceList,
  PluginInstance,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import constants from "./constants.ts";

function failedRequest(title: string): Problem {
  return {
    variant: "danger",
    title,
    body: (
      <>
        ChRIS backend might be down right now. Try refreshing, or email{" "}
        <a
          href={
            "mailto:dev@babymri.org?subject=fetalmri.org problem" +
            "&body=I think the ChRIS backend for fetalmri.org is down"
          }
        >
          dev@babyMRI.org
        </a>
      </>
    ),
  };
}

const PROBLEMS = {
  failedRequest,

  checkFeedPageOverflow: (feedList: PublicFeedList): Problem[] => {
    const notShown = feedList.totalCount - constants.FEEDS_SEARCH_LIMIT;
    if (notShown > 0) {
      return [
        {
          variant: "warning",
          title: `${notShown} feeds not shown.`,
          body: "Feed pagination not implemented.",
        },
      ];
    }
    return [];
  },

  checkPluginInstancesPageOverflow: (
    feed: Feed,
    plinstList: FeedPluginInstanceList,
  ): Problem[] => {
    const notShown =
      plinstList.totalCount - constants.PLUGININSTANCES_PER_FEED_LIMIT;
    if (notShown > 0) {
      return [
        {
          variant: "warning",
          title: `${notShown} plugin instances of "${feed.data.name}" not retrieved.`,
          body: (
            <>
              Feed id={feed.data.id} has {plinstList.totalCount} plugin
              instances, but pagination is not implemented.
            </>
          ),
        },
      ];
    }
    return [];
  },

  failedToGetFilesOf: (plinst: PluginInstance): Problem => {
    const title = `Could not get files of plugin instance id=${plinst}`;
    return failedRequest(title);
  },

  manifestNotFoundIn: ({ indexPlinst, feed }: VisualDataset): Problem => {
    return {
      variant: "danger",
      title: `Dataset (id=${indexPlinst.data.id}) is malformed`,
      body: (
        <>
          The output of plugin instance id={indexPlinst.data.id} does not
          contain a file called <code>{constants.MAGIC_DATASET_FILE}</code>.
          Please check feed (id={feed.data.id}) "{feed.data.name}".
        </>
      ),
    };
  },
} satisfies Record<
  string,
  Problem | ((...args: any[]) => Problem) | ((...args: any[]) => Problem[])
>;

export default PROBLEMS;
