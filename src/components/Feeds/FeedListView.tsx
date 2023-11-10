import React from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  Tooltip,
  Checkbox,
  PageSection,
  Pagination,
} from "@patternfly/react-core";
import { Typography } from "antd";
import { cujs } from "chris-utility";
import { useTypedSelector } from "../../store/hooks";
import { Link } from "react-router-dom";
import { FilterState, usePaginate } from "./usePaginate";
import {
  setBulkSelect,
  removeBulkSelect,
  removeAllSelect,
  toggleSelectAll,
  setAllSelect,
} from "../../store/feed/actions";
import { setSidebarActive } from "../../store/ui/actions";
import type { Feed, FeedList } from "@fnndsc/chrisapi";
import CreateFeed from "../CreateFeed/CreateFeed";
import IconContainer from "../IconContainer";
import { InfoIcon, DataTableToolbar } from "../Common";
import { CreateFeedProvider, PipelineProvider } from "../CreateFeed/context";
import { AddNodeProvider } from "../AddNode/context";
import ChrisAPIClient from "../../api/chrisapiclient";

const { Paragraph } = Typography;

export const TableSelectable: React.FunctionComponent = () => {
  // In real usage, this data would come from some external source like an API via props.

  const fetchFeeds = async (filterState: FilterState) => {
    const client = ChrisAPIClient.getClient();
    const feedsList: FeedList = await client.getFeeds({
      limit: perPage,
      offset: filterState.perPage * (filterState.page - 1),
      [filterState.searchType]: filterState.search,
    });

    const feeds: Feed[] = feedsList.getItems() || [];
    return {
      feeds,
      totalFeedsCount: feedsList.totalCount,
    };
  };

  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    dispatch,
  } = usePaginate();

  const { data } = useQuery({
    queryKey: ["feeds", filterState],
    queryFn: () => fetchFeeds(filterState),
  });

  const { selectAllToggle, bulkSelect } = useTypedSelector(
    (state) => state.feed
  );
  const { page, perPage } = filterState;

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
    if (!data || !data.totalFeedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={data.totalFeedsCount}
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
            data && data.totalFeedsCount > 0 ? data.totalFeedsCount : 0
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
            <AddNodeProvider>
              <CreateFeed />
            </AddNodeProvider>
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

          {data && <IconContainer allFeeds={data.feeds} />}
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
                      if (data) {
                        dispatch(setAllSelect(data.feeds));
                      }

                      dispatch(toggleSelectAll(true));
                    } else {
                      if (data) {
                        dispatch(removeAllSelect(data.feeds));
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
              data.feeds.map((feed, rowIndex) => {
                return (
                  <TableRow
                    key={feed.data.id}
                    feed={feed}
                    rowIndex={rowIndex}
                    bulkSelect={bulkSelect}
                    columnNames={columnNames}
                    allFeeds={data.feeds}
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
  allFeeds: Feed[];
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

function TableRow({ feed, allFeeds, bulkSelect, columnNames }: TableRowProps) {
  const [intervalMs, setIntervalMs] = React.useState(2000);

  const { data } = useQuery({
    queryKey: ["feedResources", feed],
    queryFn: async () => {
      const res = await cujs.getPluginInstanceDetails(feed);

      if (res.progress === 100 || res.error === true) {
        setIntervalMs(0);
      }

      return {
        [feed.data.id]: {
          details: res,
        },
      };
    },

    refetchInterval: intervalMs,
  });

  const feedResources = data || {};

  const { id, name: feedName, creation_date, creator_username } = feed.data;

  const { dispatch } = usePaginate();
  const progress =
    feedResources[feed.data.id] && feedResources[feed.data.id].details.progress;

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

  const created = (
    <span>
      {creation_date && (
        <span>{format(new Date(creation_date), "dd MMM yyyy, HH:mm")}</span>
      )}
    </span>
  );
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
          const newBulkSelect = [...bulkSelect, feed];
          const selectAllToggle = newBulkSelect.length === allFeeds.length;
          dispatch(setBulkSelect(newBulkSelect, selectAllToggle));
        } else {
          const filteredBulkSelect = bulkSelect.filter((selectedFeed) => {
            return selectedFeed.data.id !== feed.data.id;
          });
          const selectAllToggle = filteredBulkSelect.length === allFeeds.length;

          dispatch(removeBulkSelect(filteredBulkSelect, selectAllToggle));
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