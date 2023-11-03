import React from "react";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  Tooltip,
  Checkbox,
  PageSection,
  Pagination,
} from "@patternfly/react-core";
import { Typography } from "antd";
import { useTypedSelector } from "../../store/hooks";
import { Link } from "react-router-dom";
import { usePaginate } from "./usePaginate";
import {
  getFeedResourcesRequest,
  getAllFeedsRequest,
  stopFetchingFeedResources,
  cleanupFeedResources,
  setBulkSelect,
  removeBulkSelect,
  removeAllSelect,
  toggleSelectAll,
  setAllSelect,
} from "../../store/feed/actions";
import { setSidebarActive } from "../../store/ui/actions";
import type { Feed } from "@fnndsc/chrisapi";
import type { FeedResource } from "../../store/feed/types";
import CreateFeed from "../CreateFeed/CreateFeed";
import IconContainer from "../IconContainer";
import { InfoIcon, DataTableToolbar } from "../Common";
import { CreateFeedProvider, PipelineProvider } from "../CreateFeed/context";

const { Paragraph } = Typography;

export const TableSelectable: React.FunctionComponent = () => {
  // In real usage, this data would come from some external source like an API via props.
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
  const { data, totalFeedsCount } = allFeeds;

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

  const columnNames = {
    id: "ID",
    analysis: "Analysis",
    created: "Created",
    creator: "Creator",
    runtime: "Run Time",
    size: "Size",
    status: "Status",
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

  return (
    <React.Fragment>
      <PageSection className="feed-header">
        <InfoIcon
          title={`New and Existing Analyses (${
            totalFeedsCount > 0 ? totalFeedsCount : 0
          })`}
          p1={
            <Paragraph>
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
          <div></div>
          {generatePagination()}
        </div>
        <div className="feed-list__split">
          <DataTableToolbar
            onSearch={handleFilterChange}
            label="Filter by name"
          />
          {<IconContainer />}
        </div>
        <Table variant="compact" aria-label="Selectable table">
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
              <Th>{columnNames.id}</Th>
              <Th>{columnNames.analysis}</Th>
              <Th>{columnNames.created}</Th>
              <Th>{columnNames.creator}</Th>
              <Th>{columnNames.runtime}</Th>
              <Th>{columnNames.size}</Th>
              <Th>{columnNames.status}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data &&
              data.map((feed, rowIndex) => {
                return (
                  <TableRow
                    key={feed.data.id}
                    feed={feed}
                    feedResources={feedResources}
                    rowIndex={rowIndex}
                    bulkSelect={bulkSelect}
                    columnNames={columnNames}
                  />
                );
              })}
          </Tbody>
        </Table>
      </PageSection>
    </React.Fragment>
  );
};

export default TableSelectable;

interface TableRowProps {
  rowIndex: number;
  feed: Feed;
  feedResources: FeedResource;
  bulkSelect: Feed[];
  columnNames: {
    id: string;
    analysis: string;
    created: string;
    creator: string;
    runtime: string;
    size: string;
    status: string;
  };
}

function TableRow({
  feed,
  feedResources,
  bulkSelect,
  columnNames,
}: TableRowProps) {
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

  const size =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.size;
  const feedError =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.error;
  const runtime =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.time;

  const feedProgressText =
    feedResources[feed.data.id] &&
    feedResources[feed.data.id].details.feedProgressText;

  let threshold = Infinity;

  // If error in a feed => reflect in progres

  let title = (progress ? progress : 0) + "%";
  let color = "blue";

  if (feedError) {
    color = "#ff0000";
    threshold = progress;
  }

  // If initial node in a feed fails
  if (progress == 0 && feedError) {
    color = "#00ff00";
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
        height: "50px",
        width: "50px",
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

  const name = (
    <Tooltip content={<div>View feed details</div>}>
      <Link to={`/feeds/${feed.data.id}`}>{feedName}</Link>
    </Tooltip>
  );

  const created = <div>{creation_date}</div>;
  const isSelected = (bulkSelect: any, feed: Feed) => {
    for (const selectedFeed of bulkSelect) {
      if (selectedFeed.data.id == feed.data.id) {
        return true;
      }
    }
    return false;
  };
  const bulkCheckbox = (
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

  return (
    <Tr isSelectable key={feed.data.id}>
      <Td>{bulkCheckbox}</Td>
      <Td dataLabel={columnNames.id}>{id}</Td>
      <Td dataLabel={columnNames.analysis}>{name}</Td>
      <Td dataLabel={columnNames.created}>{created}</Td>
      <Td dataLabel={columnNames.creator}>{creator_username}</Td>
      <Td dataLabel={columnNames.runtime}>{runtime}</Td>
      <Td dataLabel={columnNames.size}>{size}</Td>
      <Td dataLabel={columnNames.status}>{circularProgress}</Td>
    </Tr>
  );
}
