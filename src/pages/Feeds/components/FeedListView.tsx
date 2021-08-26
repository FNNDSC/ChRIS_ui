import * as React from "react";
import { Dispatch } from "redux";
import { useDispatch, connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import {
  InputGroup,
  InputGroupText,
  TextInput,
  PageSection,
  Title,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Popover,
  Button,
  Grid,
  GridItem,
  Tooltip
} from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import {
  CodeBranchIcon,
  TrashAltIcon,
  SearchIcon,
} from "@patternfly/react-icons";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest, deleteFeed } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import { CreateFeedProvider } from "../../../components/feed/CreateFeed/context";
import { Feed } from "@fnndsc/chrisapi";
import {
  EmptyStateTable,
  generateTableLoading,
} from "../../../components/common/emptyTable";
import { usePaginate } from "../../../components/common/pagination";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

type AllProps = IFeedState & IPropsFromDispatch;

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  allFeeds,
  getAllFeedsRequest,
}: AllProps) => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    debouncedFilterUpdate,
    run,
  } = usePaginate();
  const [currentId, setCurrentId] = React.useState<string | number>("none");
  const { page, perPage } = filterState;
  const { data, error, loading, totalFeedsCount } = allFeeds;

  React.useEffect(() => {
    document.title = "All Feeds - ChRIS UI ";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
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
    const totalJobsRunning =
      feed.data.created_jobs +
      feed.data.registering_jobs +
      feed.data.scheduled_jobs +
      feed.data.started_jobs +
      feed.data.waiting_jobs;

    const name = {
      title: (
        <span className="feed-list__name">
          <CodeBranchIcon />
          <Link to={`/feeds/${feed.data.id}`}>{feed.data.name}</Link>
        </span>
      ),
    };

    const errorCount = feed.data.errored_jobs + feed.data.cancelled_jobs;

    const created = {
      title: (
        <Moment format="DD MMM YYYY , HH:mm">{feed.data.creation_date}</Moment>
      ),
    };

    const lastCommit = {
      title: <Moment fromNow>{feed.data.modification_date}</Moment>,
    };

    const jobsRunning = {
      title: <span className="feed-list__count">{totalJobsRunning}</span>,
    };

    const jobsDone = {
      title: (
        <span className="feed-list__count">{feed.data.finished_jobs}</span>
      ),
    };

    const jobsErrors = {
      title: <span className="feed-list__count">{errorCount}</span>,
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
                <TrashAltIcon
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
        lastCommit,
        jobsRunning,
        jobsDone,
        jobsErrors,
        removeFeed,
      ],
    };
  };

  const cells = [
    "Feed",
    "Created",
    "Last Commit",
    "Jobs Running",
    "Jobs Done",
    "Errors",
    "",
  ];

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
    <article style={{ maxWidth: "100%" }}>
      <Grid>
        <GridItem>
          <PageSection className="feed-header">
            <div className="feed-header__split">
              <Title headingLevel="h1" size="3xl">
                My Feeds
                {totalFeedsCount > 0 ? (
                  <span className="feed-header__count">({totalFeedsCount})</span>
                ) : null}
              </Title>
              <CreateFeedProvider>
                <CreateFeed />
              </CreateFeedProvider>
            </div>
          </PageSection>
        </GridItem>
        <GridItem>
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
                <TableHeader />
                {loading ? generateTableLoading() : <TableBody />}
              </Table>
            )}
          </PageSection>
        </GridItem>
      </Grid>
    </article>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string, limit?: number, offset?: number) =>
    dispatch(getAllFeedsRequest(name, limit, offset)),
});

const mapStateToProps = ({ feed }: ApplicationState) => ({
  allFeeds: feed.allFeeds,
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
