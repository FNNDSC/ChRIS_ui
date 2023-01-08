import * as React from "react";
import { Typography } from "antd";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import "@patternfly/react-core/dist/styles/base.css";
import {
  PageSection,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Checkbox,
  Tooltip,
} from "@patternfly/react-core";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
} from "@patternfly/react-table";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Feed } from "@fnndsc/chrisapi";
import {
  getAllFeedsRequest,
  setBulkSelect,
  removeBulkSelect,
  getFeedResourcesRequest,
  removeAllSelect,
  setAllSelect,
  toggleSelectAll,
  stopFetchingFeedResources,
  cleanupFeedResources,
} from "../../../store/feed/actions";
import { setSidebarActive } from "../../../store/ui/actions";
import { DataTableToolbar } from "../../../components/index";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import {
  CreateFeedProvider,
  PipelineProvider,
} from "../../../components/feed/CreateFeed/context";
import {
  EmptyStateTable,
  generateTableLoading,
} from "../../../components/common/emptyTable";
import { usePaginate } from "../../../components/common/pagination";
import IconContainer from "./IconContainer";
import { useTypedSelector } from "../../../store/hooks";
import { FeedResource } from "../../../store/feed/types";
import InfoIcon from "../../../components/common/info/InfoIcon";
const { Paragraph } = Typography;

const FeedListView: React.FC = () => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
    dispatch,
  } = usePaginate();
  const { allFeeds, selectAllToggle, feedResources, bulkSelect } =
    useTypedSelector((state) => state.feed);
  const { page, perPage } = filterState;
  const { data, error, loading, totalFeedsCount } = allFeeds;

  const bulkData = React.useRef<Feed[]>();
  bulkData.current = bulkSelect;

  React.useEffect(() => {
    document.title = "All Analyses - ChRIS UI ";
    dispatch(
      setSidebarActive({
        activeItem: "analyses",
      })
    );
    if (bulkData && bulkData.current) {
      dispatch(removeAllSelect(bulkData.current));
    }
  }, [dispatch]);

  const getAllFeeds = React.useCallback(() => {
    run(getAllFeedsRequest);
  }, [run]);

  React.useEffect(() => {
    getAllFeeds();
  }, [getAllFeeds]);

  React.useEffect(() => {
    if (selectAllToggle && allFeeds.data && allFeeds.data.length > 0) {
      dispatch(setAllSelect(allFeeds.data));
    }
  }, [allFeeds.data, dispatch, selectAllToggle]);

  const cells = [
    "",
    "Id",
    "Analysis",
    "Created",
    "Creator",
    "Run Time",
    "Size",
  ];

  const customRowWrapper = (row: any) => {
    const { children } = row;

    const backgroundStyle = {
      backgroundColor: "#F9E0A2",
    };
    return <Tr style={backgroundStyle}>{children}</Tr>;
  };

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

  const style = { fontSize: "1.15em" };

  return (
    <React.Fragment>
      <PageSection className="feed-header" variant="light">
        <InfoIcon
          title={`New and Existing Analyses (${
            totalFeedsCount > 0 ? totalFeedsCount : 0
          })`}
          p1={
            <Paragraph style={style}>
              Analyses (aka ChRIS feeds) are computational experiments where
              data are organized and processed by ChRIS plugins. In this view
              you may view your analyses and also the ones shared with you.
            </Paragraph>
          }
        />

        <CreateFeedProvider>
          <PipelineProvider>
            <CreateFeed />
          </PipelineProvider>
        </CreateFeedProvider>
      </PageSection>

      <PageSection className="feed-list">
        <div className="feed-list__split">
          <DataTableToolbar
            onSearch={handleFilterChange}
            label="filter by name"
          />
          {bulkSelect.length > 0 && <IconContainer />}

          {generatePagination()}
        </div>
        {(!data && !loading) || (data && data.length === 0) ? (
          <EmptyStateTable
            cells={cells}
            rows={[]}
            caption="Empty Feed List"
            title="No Feeds Found"
            description="Create a Feed by clicking on the 'Create Feed' button"
          />
        ) : (
          <TableComposable
            variant="compact"
            aria-label="Data table"
            cells={cells}
            isStickyHeader
            rowWrapper={customRowWrapper}
          >
            {
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox
                      id="test"
                      isChecked={selectAllToggle}
                      onChange={() => {
                        if (!selectAllToggle) {
                          if (allFeeds.data) {
                            dispatch(setAllSelect(allFeeds.data));
                          }

                          dispatch(toggleSelectAll(true));
                        } else {
                          if (allFeeds.data) {
                            dispatch(removeAllSelect(allFeeds.data));
                          }
                          dispatch(toggleSelectAll(false));
                        }
                      }}
                    />
                  </Th>
                  <Th>Id</Th>
                  <Th>Analysis</Th>
                  <Th>Created</Th>
                  <Th>Creator</Th>
                  <Th>Run Time</Th>
                  <Th
                    style={{
                      textAlign: "center",
                      margin: "0 auto",
                    }}
                  >
                    Size
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
            }

            {loading ? (
              generateTableLoading("white")
            ) : (
              <Tbody>
                {data &&
                  data.map((feed) => {
                    return (
                      <TableRow
                        key={feed.data.id}
                        feed={feed}
                        feedResources={feedResources}
                        bulkSelect={bulkSelect}
                      />
                    );
                  })}
              </Tbody>
            )}
          </TableComposable>
        )}
      </PageSection>
    </React.Fragment>
  );
};

export default FeedListView;

const TableRow = ({
  feed,
  feedResources,
  bulkSelect,
}: {
  feed: Feed;
  feedResources: FeedResource;
  bulkSelect: Feed[];
}) => {
  const { id, name: feedName, creation_date, creator_username } = feed.data;
  const { dispatch } = usePaginate();
  const progress =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.progress;

  React.useEffect(() => {
    dispatch(getFeedResourcesRequest(feed));
    return () => {
      dispatch(stopFetchingFeedResources(feed));
      dispatch(cleanupFeedResources(feed));
    };
  }, [dispatch, feed]);

  const fontFamily = {
    fontFamily: "monospace",
  };

  const size =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.size;
  const feedError =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.error;
  const runtime =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.time;

  const feedProgressText =
    feedResources[feed.data.id] &&
    feedResources[feed.data.id].details.feedProgressText;

  const name = (
    <span className="feed-list__name">
      <Tooltip content={<div>View feed details</div>}>
        <Link to={`/feeds/${id}`}>{feedName}</Link>
      </Tooltip>
    </span>
  );

  const feedId = <p style={fontFamily}>{feed.data.id}</p>;

  const created = (
    <span style={fontFamily}>
      <Moment format="DD MMM YYYY, HH:mm">{creation_date}</Moment>{" "}
    </span>
  );

  const feedSize = (
    <p
      style={{
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      <span className="feed-list__name">
        <Tooltip content={<div>View files in library</div>}>
          <Link to={`/library/`}>
            {size ? `${size.padStart(10, "")}` : "---"}
          </Link>
        </Tooltip>
      </span>
    </p>
  );

  const runTime = <p style={fontFamily}>{runtime ? `${runtime}` : "---"}</p>;

  const creator = <p>{creator_username}</p>;

  let threshold = Infinity;
  let color = "#0000ff";

  // If error in a feed => reflect in progress
  if (feedError) {
    color = "#ff0000";
    threshold = progress;
  }
  let title = (progress ? progress : 0) + "%";

  // If initial node in a feed fails
  if (progress == 0 && feedError) {
    title = "❌";
  }

  // If progress less than 100%, display green
  if (progress < 100 && !feedError) {
    color = "#00ff00";

    threshold = progress;
  }
  if (progress == 100) {
    title = "✔️";
  }

  const circularProgress = (
    <div
      style={{
        textAlign: "right",
        height: "40px",
        width: "40px",
        display: "block",
      }}
    >
      <ChartDonutUtilization
        ariaTitle={feedProgressText}
        data={{ x: "Analysis Progress", y: progress }}
        height={125}
        title={title}
        thresholds={[{ value: threshold, color: color }]}
        width={125}
      />
    </div>
  );

  const isSelected = (bulkSelect: any, feed: Feed) => {
    for (const selectedFeed of bulkSelect) {
      if (selectedFeed.data.id == feed.data.id) {
        return true;
      }
    }
    return false;
  };
  const bulkChecbox = (
    <Checkbox
      isChecked={isSelected(bulkSelect, feed)}
      id="check"
      aria-label="toggle icon bar"
      onChange={() => {
        if (!isSelected(bulkSelect, feed)) {
          dispatch(setBulkSelect(feed));
        } else {
          dispatch(removeBulkSelect(feed));
        }
      }}
    />
  );
  const backgroundRow =
    progress && progress < 100 && !feedError ? "#F9E0A2" : "#FFFFFF";
  const selectedBgRow = isSelected(bulkSelect, feed)
    ? "rgb(231, 241, 250)"
    : backgroundRow;
  return (
    <Tr
      key={feed.data.id}
      isSelectable
      isHoverable
      isRowSelected={isSelected(bulkSelect, feed)}
      style={{
        backgroundColor: selectedBgRow,
      }}
    >
      <Td>{bulkChecbox}</Td>
      <Td>{feedId}</Td>
      <Td>{name}</Td>
      <Td>{created}</Td>
      <Td>{creator}</Td>
      <Td>{runTime}</Td>
      <Td>{feedSize}</Td>
      <Td>{circularProgress}</Td>
    </Tr>
  );
};
