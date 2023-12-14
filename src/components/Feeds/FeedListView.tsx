import React, { useContext, useMemo } from "react";

import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";
import {
  Tooltip,
  Checkbox,
  PageSection,
  Pagination,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateHeader,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupItemProps,
  Button,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { Typography } from "antd";
import { cujs } from "chris-utility";
import { useTypedSelector } from "../../store/hooks";
import { usePaginate } from "./usePaginate";
import {
  setBulkSelect,
  removeBulkSelect,
  removeAllSelect,
  toggleSelectAll,
  setAllSelect,
} from "../../store/feed/actions";
import { setSidebarActive } from "../../store/ui/actions";
import type { Feed } from "@fnndsc/chrisapi";
import CreateFeed from "../CreateFeed/CreateFeed";
import IconContainer from "../IconContainer";
import WrapperConnect from "../Wrapper";
import { InfoIcon, DataTableToolbar } from "../Common";
import { CreateFeedProvider, PipelineProvider } from "../CreateFeed/context";
import { AddNodeProvider } from "../AddNode/context";
import { ThemeContext } from "../DarkTheme/useTheme";
import { fetchPublicFeeds, fetchFeeds } from "./utilties";

const { Paragraph } = Typography;

function useSearchQueryParams() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function useSearchQuery(query: URLSearchParams) {
  const page = query.get("page") || 1;
  const search = query.get("search") || "";
  const searchType = query.get("searchType") || "name";
  const perPage = query.get("perPage") || 14;
  const type = query.get("type") || "public";

  return {
    page,
    perPage,
    search,
    searchType,
    type,
  };
}
const TableSelectable: React.FunctionComponent = () => {
  const query = useSearchQueryParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchFolderData = useSearchQuery(query);
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const { perPage, page, type } = searchFolderData;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feeds", searchFolderData],
    queryFn: () => fetchFeeds(searchFolderData),
    enabled: isLoggedIn && type === "private",
  });

  const {
    data: publicFeeds,
    isLoading: publicFeedLoading,
    isFetching: publicFeedFetching,
  } = useQuery({
    queryKey: ["publicFeeds", searchFolderData],
    queryFn: () => fetchPublicFeeds(searchFolderData),
    enabled: type === "public",
  });

  const authenticatedFeeds = data ? data.feeds : [];
  const publicFeedsToDisplay = publicFeeds ? publicFeeds.feeds : [];

  const feedsToDisplay =
    type === "private" ? authenticatedFeeds : publicFeedsToDisplay;

  const { selectAllToggle, bulkSelect } = useTypedSelector(
    (state) => state.feed
  );

  const onSetPage = (_e: any, newPage: number) => {
    navigate(`/feeds?page=${newPage}&type=${type}`);
  };

  const onPerPageSelect = (_e: any, newPerPage: number, newPage: number) => {
    navigate(`/feeds?page=${newPage}&perPage=${newPerPage}&type=${type}`);
  };

  const handleFilterChange = (search: string, searchType: string) => {
    navigate(`/feeds?search=${search}&searchType=${searchType}&type=${type}`);
  };

  const onExampleTypeChange: ToggleGroupItemProps["onChange"] = (
    event,
    _isSelected
  ) => {
    const id = event.currentTarget.id;
    navigate(`/feeds?page=${page}&perPage=${perPage}&type=${id}`);
  };

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

  React.useEffect(() => {
    const type = isLoggedIn ? "private" : "public";
    navigate(`/feeds?page=${page}&perPage=${perPage}&type=${type}`);
  }, [isLoggedIn]);

  const columnNames = {
    id: "ID",
    analysis: "Analysis",
    created: "Created",
    creator: "Creator",
    runtime: "Run Time",
    size: "Size",
    status: "Status",
  };

  console.log("PublicFeeds", data, publicFeeds);

  const generatePagination = (type: string) => {
    console.log("Type", type);
    return (
      <Pagination
        itemCount={
          type === "private"
            ? data?.totalFeedsCount
            : publicFeeds?.totalFeedsCount
        }
        perPage={+perPage}
        page={+page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    );
  };

  return (
    <React.Fragment>
      <WrapperConnect>
        <PageSection className="feed-header">
          <InfoIcon
            title={`New and Existing Analyses (${
              type === "private"
                ? data && data.totalFeedsCount
                : publicFeeds && publicFeeds.totalFeedsCount
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
            <div>
              <ToggleGroup aria-label="Default with single selectable">
                <ToggleGroupItem
                  text="Authenticated Feeds"
                  buttonId="private"
                  isSelected={type === "private"}
                  onChange={onExampleTypeChange}
                  isDisabled={!isLoggedIn}
                />
                <ToggleGroupItem
                  text="Public Feeds"
                  buttonId="public"
                  isSelected={type === "public"}
                  onChange={onExampleTypeChange}
                />
              </ToggleGroup>
            </div>
            {generatePagination(type)}
          </div>
          <div className="feed-list__split">
            <DataTableToolbar
              onSearch={handleFilterChange}
              label="Filter by name"
            />

            {feedsToDisplay && <IconContainer allFeeds={feedsToDisplay} />}
          </div>
          {isLoading ||
          isFetching ||
          publicFeedLoading ||
          publicFeedFetching ? (
            <LoadingTable />
          ) : feedsToDisplay.length > 0 ? (
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
                            dispatch(setAllSelect(feedsToDisplay));
                          }

                          dispatch(toggleSelectAll(true));
                        } else {
                          if (data) {
                            dispatch(removeAllSelect(feedsToDisplay));
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
                {feedsToDisplay.map((feed, rowIndex) => {
                  return (
                    <TableRow
                      key={feed.data.id}
                      feed={feed}
                      rowIndex={rowIndex}
                      bulkSelect={bulkSelect}
                      columnNames={columnNames}
                      allFeeds={feedsToDisplay}
                    />
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <EmptyStateTable />
          )}
        </PageSection>
      </WrapperConnect>
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
  const navigate = useNavigate();
  const [intervalMs, setIntervalMs] = React.useState(2000);
  const { isDarkTheme } = useContext(ThemeContext);

  const { data } = useQuery({
    queryKey: ["feedResources", feed],
    queryFn: async () => {
      try {
        const res = await cujs.getPluginInstanceDetails(feed);

        if (res.progress === 100 || res.error === true) {
          setIntervalMs(0);
        }

        return {
          [feed.data.id]: {
            details: res,
          },
        };
      } catch (error) {
        setIntervalMs(0);
        return {};
      }
    },

    refetchInterval: intervalMs,
  });

  const feedResources = data || {};

  const { id, name: feedName, creation_date, creator_username } = feed.data;

  const { dispatch } = usePaginate();
  const progress = feedResources[id] && feedResources[id].details.progress;

  const size = feedResources[id] && feedResources[id].details.size;
  const feedError = feedResources[id] && feedResources[id].details.error;
  const runtime = feedResources[id] && feedResources[id].details.time;

  const feedProgressText =
    feedResources[id] && feedResources[id].details.feedProgressText;

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
      <Button
        variant="link"
        onClick={() => {
          navigate(`/feeds/${id}`);
        }}
      >
        {feedName}
      </Button>
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

  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  const backgroundRow =
    progress && progress < 100 && !feedError ? backgroundColor : "inherit";
  const selectedBgRow = isSelected(bulkSelect, feed)
    ? backgroundColor
    : backgroundRow;

  return (
    <Tr
      isSelectable
      key={feed.data.id}
      style={{
        backgroundColor: selectedBgRow,
      }}
    >
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

function EmptyStateTable() {
  return (
    <Table variant="compact" aria-label="Empty state table">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Analysis</Th>
          <Th>Created</Th>
          <Th>Creator</Th>
          <Th>Run Time</Th>
          <Th>Size</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={12}>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.sm}>
                <EmptyStateHeader
                  icon={<EmptyStateIcon icon={SearchIcon} />}
                  titleText="No results found"
                  headingLevel="h2"
                />
              </EmptyState>
            </Bullseye>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}

function LoadingTable() {
  return (
    <div style={{ height: "100%" }}>
      <Skeleton
        height="100%"
        screenreaderText="Loading large rectangle contents"
      />
    </div>
  );
}
