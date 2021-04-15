import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import debounce from "lodash/debounce";
import {
  PageSection,
  PageSectionVariants,
  Title,
  Pagination,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Button
} from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { CodeBranchIcon, SearchIcon , EyeIcon} from "@patternfly/react-icons";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { DataTableToolbar } from "../../../components/index";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import LoadingContent from "../../../components/common/loading/LoadingContent";
import { CreateFeedProvider } from "../../../components/feed/CreateFeed/context";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

interface FeedListViewState {
  perPage: number;
  page: number;
  filter: string;
  descriptions: { [feedId: number]: string };
}

type AllProps = IFeedState & IPropsFromDispatch;

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  allFeeds,
  getAllFeedsRequest,
}: AllProps) => {
  const [filterState, setFilterState] = React.useState<FeedListViewState>({
    perPage: 10,
    page: 1,
    filter: "",
    descriptions: {},
  });

  const generateTableRow = (feed: any) => {
    const totalJobsRunning =
      feed.created_jobs +
      feed.registering_jobs +
      feed.scheduled_jobs +
      feed.started_jobs +
      feed.waiting_jobs;

    const name = {
      title: (
        <span className="feed-list__name">
          <CodeBranchIcon />
          <Link to={`/feeds/${feed.id}`}>{feed.name}</Link>
        </span>
      ),
    };

    const errorCount = feed.errored_jobs + feed.cancelled_jobs;

    const created = {
      title: <Moment format="DD MMM YYYY , HH:mm">{feed.creation_date}</Moment>,
    };

    const lastCommit = {
      title: <Moment fromNow>{feed.modification_date}</Moment>,
    };

    const jobsRunning = {
      title: <span className="feed-list__count">{totalJobsRunning}</span>,
    };

    const jobsDone = {
      title: <span className="feed-list__count">{feed.finished_jobs}</span>,
    };

    const jobsErrors = {
      title: <span className="feed-list__count">{errorCount}</span>,
    };

    const viewDetails = {
      title: (
        <Link to={`/feeds/${feed.id}`}>
          <Button icon={<EyeIcon />} variant="link">
            View feed details
          </Button>
        </Link>
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
        viewDetails,
      ],
    };
  };

  const { page, perPage, filter } = filterState;
  const { data, error, loading, totalFeedsCount } = allFeeds;
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

  const handlePageSet = (e: any, page: number) => {
    setFilterState({
      ...filterState,
      page,
    });
  };

  const handlePerPageSet = (e: any, perPage: number) => {
    setFilterState({ ...filterState, perPage });
  };

  const handleFilterChange = debounce((value: string) => {
    setFilterState({
      ...filterState,
      filter: value,
    });
  }, 200);

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

  const generateTableLoading = () => {
    return (
      <tbody className="feed-list__loading">
        <tr>
          <td colSpan={6}>
            {new Array(6).fill(null).map((_, i) => (
              <LoadingContent height="45px" width="100%" key={i} />
            ))}
          </td>
        </tr>
      </tbody>
    );
  };

  React.useEffect(() => {
    document.title = "All Feeds - ChRIS UI ";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
  }, [setSidebarActive]);

  const getAllFeeds = React.useCallback(() => {
    getAllFeedsRequest(filter, perPage, perPage * (page - 1));
  }, [page, perPage, filter, getAllFeedsRequest]);

  React.useEffect(() => {
    getAllFeeds();
  }, [getAllFeeds]);

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
      <PageSection className="feed-list">
        <div className="feed-list__split">
          <DataTableToolbar
            onSearch={handleFilterChange}
            label="filter by name"
          />
          {generatePagination()}
        </div>
        {!data && !loading ? (
          <React.Fragment>
            <Table caption="Empty Feed List" cells={cells} rows={rows}>
              <TableHeader />
              <TableBody />
            </Table>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h2" size="lg">
                No Feeds Found
              </Title>
              <EmptyStateBody>
                Create a Feed by clicking on the &apos;Create Feed&apos; button
              </EmptyStateBody>
            </EmptyState>
          </React.Fragment>
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
      )
    </React.Fragment>
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
