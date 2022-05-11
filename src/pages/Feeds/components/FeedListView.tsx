import * as React from "react";
import { Dispatch } from "redux";
import { useDispatch, connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import pluralize from "pluralize";
import "@patternfly/react-core/dist/styles/base.css";

import {
  PageSection,
  PageSectionVariants,
  Title,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Popover,
  Button,
  Tooltip,
  Hint,
  HintBody
} from "@patternfly/react-core";
import { Table, TableBody, Thead, Tr, Th } from "@patternfly/react-table";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { FaTrashAlt, FaExclamationCircle, FaCircle } from "react-icons/fa";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import {
  getAllFeedsRequest,
  deleteFeed,
  downloadFeedRequest,
} from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { DataTableToolbar } from "../../../components/index";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import { CreateFeedProvider } from "../../../components/feed/CreateFeed/context";
import {
  EmptyStateTable,
  generateTableLoading,
} from "../../../components/common/emptyTable";
import { usePaginate } from "../../../components/common/pagination";
import { MdFileDownload } from "react-icons/md";
import { Feed } from "@fnndsc/chrisapi";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

type AllProps = IFeedState & IPropsFromDispatch;

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  allFeeds,
  getAllFeedsRequest,
  downloadStatus,
}: AllProps) => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
  } = usePaginate();
  const [currentId, setCurrentId] = React.useState<string | number>("none");
  const { page, perPage } = filterState;
  const { data, error, loading, totalFeedsCount } = allFeeds;

  React.useEffect(() => {
    document.title = "All Analyses - ChRIS UI ";
    setSidebarActive({
      activeItem: "analyses",
    });
  }, [setSidebarActive]);

  const handleToggle = (currentId: number | string) => {
    setCurrentId(currentId);
  };

  const getAllFeeds = React.useCallback(() => {
    run(getAllFeedsRequest);
  }, [getAllFeedsRequest, run]);

  React.useEffect(() => {
    getAllFeeds();
  }, [getAllFeeds]);

  const generateTableRow = (feed: Feed) => {
    const {
      id,
      name: feedName,
      modification_date,
      creation_date,
      finished_jobs,
    } = feed.data;
    const {
      created_jobs,
      registering_jobs,
      scheduled_jobs,
      started_jobs,
      waiting_jobs,
    } = feed.data;
    const { errored_jobs, cancelled_jobs } = feed.data;
    const name = {
      title: (
        <span className="feed-list__name">
          <Link to={`/feeds/${id}`}>{feedName}</Link>
        </span>
      ),
    };

    const runningJobsCount =
      created_jobs +
      registering_jobs +
      scheduled_jobs +
      started_jobs +
      waiting_jobs;

    const error = errored_jobs + cancelled_jobs;

    const jobsCountText =
      runningJobsCount > 0 ? (
        <>
          <FaCircle
            style={{
              color: "var(--pf-global--palette--blue-400)",
              margin: "auto 0.25em",
            }}
          />
          <b>
            Running {runningJobsCount} {pluralize("job", runningJobsCount)}
          </b>
        </>
      ) : (
        <b>
          Completed {finished_jobs} {pluralize("job", finished_jobs)}
        </b>
      );

    const displayErrorCount =
      error > 0 ? (
        <Tooltip
          content={`${errored_jobs} errors, ${cancelled_jobs} cancelled`}
        >
          <span style={{ color: "firebrick", fontSize: "small" }}>
            <FaExclamationCircle style={{ margin: "auto 0.25em" }} />
            {error} {pluralize("Error", error)}
          </span>
        </Tooltip>
      ) : (
        <span style={{ fontSize: "small", color: "grey" }}>
          {jobsCountText}
        </span>
      );

    const errorCount = {
      title: displayErrorCount,
    };

    const lastCommit = {
      title: (
        <span>
          Last Commit <Moment fromNow>{modification_date}</Moment>{" "}
        </span>
      ),
    };

    const created = {
      title: (
        <span>
          <Moment format="DD MMM , HH:mm">{creation_date}</Moment>{" "}
        </span>
      ),
    };

    const downloadFeed = {
      title: <DownloadFeed key={feed.data.id} feed={feed} />,
    };

    const feedSize = {
      title: <p>coming soon</p>,
    };

    const runTime = {
      title: <p>coming soon</p>,
    };

    const getProgress = function (feed: Feed) {
      let progress = 0;

      if (runningJobsCount == 0) {
        progress = 100;
      } else {
        progress = (finished_jobs / (runningJobsCount + finished_jobs)) * 100;
      }

      return Math.round(progress);
    };

    let feedProgressText =
      finished_jobs +
      "/" +
      (runningJobsCount + finished_jobs) +
      " jobs completed";
    let progress = getProgress(feed);
    let percentage = progress + "%";
    if (error) {
      progress += 100;
      percentage = "X";
      feedProgressText = error + "/" + (finished_jobs + error) + " jobs failed";
    }

    const circularProgress = {
      title: (
        <div style={{ height: "40px", width: "40px", display: "block" }}>
          <ChartDonutUtilization
            ariaTitle={feedProgressText}
            data={{ x: "Feed Progress", y: progress }}
            height={125}
            title={percentage}
            thresholds={[{ value: 101 }, { value: 102 }]}
            width={125}
          />
        </div>
      ),
    };

    const removeFeed = {
      title: (
        <Popover
          key={feed.data.id}
          isVisible={feed.data.id === currentId}
          aria-label="delete-feed"
          bodyContent={
            <DeleteFeed
              key={feed.data.id}
              feed={feed}
              onTogglePopover={handleToggle}
            />
          }
          position="bottom"
          shouldClose={() => setCurrentId("none")}
        >
          <Button
            style={{
              background: "inherit",
            }}
            onClick={() => setCurrentId(feed.data.id)}
            icon={
              <Tooltip content={<div>Delete the Feed</div>}>
                <FaTrashAlt
                  style={{
                    color: "#004080 ",
                  }}
                />
              </Tooltip>
            }
          />
        </Popover>
      ),
    };

    return {
      cells: [
        name,
        created,
        feedSize,
        runTime,
        circularProgress,
        downloadFeed,
        removeFeed,
      ],
    };
  };

  const cells = ["Analysis", "Created", "Size", "Run Time", "", "", ""];

  const rows = data && data.length > 0 ? data.map(generateTableRow) : [];

  const generatePagination = () => {
    if (!data || !totalFeedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={totalFeedsCount}
        perPage={perPage}
        page={page}
        onSetPage={handlePageSet}
        onPerPageSelect={handlePerPageSet}
      />
    );
  };

  if (error) {
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateBody>
            Unable to fetch feeds at the moment. Please refresh the browser. If
            the issue persists, Contact the dev team at FNNDSC to report your
            error.
          </EmptyStateBody>
        </EmptyState>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light} className="feed-header">
        <div className="feed-header__split">
          <Title headingLevel="h1" size="3xl">
            New and Existing Analyses
            {totalFeedsCount > 0 ? (
              <span className="feed-header__count">({totalFeedsCount})</span>
            ) : null}
          </Title>
          <CreateFeedProvider>
            <CreateFeed />
          </CreateFeedProvider>
        </div>
        <Hint
          //@ts-ignore
          style={{
            width: "50%",
            paddingBottom: "0",
          }}
        >
          <HintBody>
            All Analyses that you have completed are recorded here. You can
            easily return to a completed analysis and add more analysis
            components, or you can create a brand new analysis from scratch.
          </HintBody>
        </Hint>
      </PageSection>
      <PageSection className="feed-list">
        <div className="feed-list__split">
          <DataTableToolbar
            onSearch={handleFilterChange}
            label="filter by name"
          />
          {generatePagination()}
        </div>
        {(!data && !loading) || (data && data.length === 0) ? (
          <EmptyStateTable
            cells={cells}
            rows={rows}
            caption="Empty Feed List"
            title="No Feeds Found"
            description="Create a Feed by clicking on the 'Create Feed' button"
          />
        ) : (
          <Table
            variant="compact"
            aria-label="Data table"
            cells={cells}
            rows={rows}
          >
            {
              <Thead>
                <Tr>
                  <Th>Analysis</Th>
                  <Th>Created</Th>
                  <Th>Size</Th>
                  <Th>Run Time</Th>
                  <Th></Th>
                  <Th></Th>
                  <Th></Th>
                </Tr>
              </Thead>
            }

            {loading ? generateTableLoading() : <TableBody />}
          </Table>
        )}
      </PageSection>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string, limit?: number, offset?: number) =>
    dispatch(getAllFeedsRequest(name, limit, offset)),
});

const mapStateToProps = ({ feed }: ApplicationState) => ({
  allFeeds: feed.allFeeds,
  downloadStatus: feed.downloadStatus,
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView);

function DeleteFeed({
  feed,
  onTogglePopover,
}: {
  feed: Feed;
  onTogglePopover: (currentId: number | string) => void;
}) {
  const dispatch = useDispatch();
  return (
    <>
      <p>Are you sure you want to delete this feed?</p>
      <Button
        style={{
          marginRight: "0.5em",
        }}
        onClick={() => {
          dispatch(deleteFeed(feed));
        }}
      >
        Yes
      </Button>
      <Button onClick={() => onTogglePopover("none")}>No</Button>
    </>
  );
}

function DownloadFeed({ feed }: { feed: Feed }) {
  const dispatch = useDispatch();
  return (
    <>
      <Button
        style={{
          background: "inherit",
        }}
        onClick={() => dispatch(downloadFeedRequest(feed))}
      >
        {
          <Tooltip content={<div>Download the Feed</div>}>
            <MdFileDownload
              style={{
                color: "#004080 ",
              }}
              className="download-file-icon"
            />
          </Tooltip>
        }
      </Button>
    </>
  );
}
