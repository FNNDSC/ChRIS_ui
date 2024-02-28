import { Problem, VisualDataset, constants } from "../../../datasets";
import {
  Feed,
  FeedPluginInstanceList,
  PluginInstance,
  PublicFeedList,
} from "@fnndsc/chrisapi";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";

function failedRequest(title: React.ReactNode): Problem {
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

  failedRequestForPluginInstance(plinstId: number | string): Problem {
    return failedRequest(`Could not get plugin instance id=${plinstId}`);
  },

  failedRequestForPreviousOf(plinst: PluginInstance): Problem {
    return failedRequest(
      `Could not get previous of plugin instance id=${plinst.data.id}`,
    );
  },

  failedRequestForFeedOf(plinst: PluginInstance): Problem {
    return failedRequest(
      `Could not get the feed of plugin instance id=${plinst.data.id}`,
    );
  },

  hasNoPrevious(plinst: PluginInstance): Problem {
    return {
      variant: "danger",
      title: `Plugin instance id=${plinst.data.id} does not have a previous.`,
      body: (
        <>
          A visual dataset is comprised of two plugin instances. See
          documentation:{" "}
          <a
            href="https://chrisproject.org/docs/visual_dataset/for_dataset_publishers"
            target="_blank"
          >
            https://chrisproject.org/docs/visual_dataset/for_dataset_publishers
          </a>
        </>
      ),
    };
  },

  invalidPluginInstanceId(plinstId: string): Problem {
    return {
      variant: "danger",
      title: `"${plinstId}" is not a valid plugin instance ID.`,
      body: "Please double-check that the URL of this page.",
    };
  },

  checkFeedPageOverflow(feedList: PublicFeedList): Problem[] {
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

  checkPluginInstancesPageOverflow(
    feed: Feed,
    plinstList: FeedPluginInstanceList,
  ): Problem[] {
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

  failedToGetFilesOf(plinst: PluginInstance): Problem {
    const title = `Could not get files of plugin instance id=${plinst}`;
    return failedRequest(title);
  },

  manifestNotFoundIn({ indexPlinst, feed }: VisualDataset): Problem {
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

  failedRequestForFile(file: FpFileBrowserFile | string): Problem {
    const fname = typeof file === "string" ? file : file.fname;
    return failedRequest(
      <>
        Failed to get file data: <code>{fname}</code>
      </>,
    );
  },

  invalidJson(file: string): Problem {
    return {
      variant: "danger",
      title: (
        <span>
          File data could not be parsed as JSON: <code>{file}</code>
        </span>
      ),
      body: (
        <>
          The dataset is malformed, which is probably a bug in
          <code>pl-visual-dataset</code>.
        </>
      ),
    };
  },

  fileNotFound(dirname: string, basename: string): Problem {
    return {
      variant: "danger",
      title: (
        <>
          File <code>{basename}</code> not found in <code>{dirname}</code>.
        </>
      ),
      body: (
        <>
          This app assumes each directory contains a small number of files, so
          pagination is not implemented.
        </>
      ),
    };
  },

  invalidSidecar(file: string, errorMsg: string): Problem {
    return {
      variant: "warning",
      title: (
        <>
          Could not get sidecar file for <code>{file}</code>
        </>
      ),
      body: errorMsg,
    };
  },

  couldNotGetColormaplabel(colormapLabelFile: string): Problem {
    return {
      variant: "warning",
      title: (
        <>
          Could not get colormap <code>{colormapLabelFile}</code>
        </>
      ),
    };
  },
} satisfies Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: it's fine to use any for rest arguments in satisfies operator
  Problem | ((...args: any[]) => Problem | Problem[])
>;

export default PROBLEMS;
