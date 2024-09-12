import type { Feed } from "@fnndsc/chrisapi";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  Pagination,
  Skeleton,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { SortByDirection } from "@patternfly/react-table";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { debounce } from "lodash";
import type React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTypedSelector } from "../../store/hooks";
import { AddNodeProvider } from "../AddNode/context";
import { Typography } from "../Antd";
import CreateFeed from "../CreateFeed/CreateFeed";
import { CreateFeedProvider } from "../CreateFeed/context";
import { ThemeContext } from "../DarkTheme/useTheme";
import { SearchIcon } from "../Icons";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext } from "../NewLibrary/context";
import useLongPress from "../NewLibrary/utils/longpress";
import { PipelineProvider } from "../PipelinesCopy/context";
import WrapperConnect from "../Wrapper";
import FeedSearch from "./FeedsSearch";
import { useFeedListData } from "./useFeedListData";
import { formatBytes, getPluginInstanceDetails } from "./utilties";
const { Paragraph } = Typography;

interface ColumnDefinition {
  id: string;
  label: string;
  comparator: (a: Feed, b: Feed, detailsA: any, detailsB: any) => number;
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    id: "id",
    label: "ID",
    comparator: (a, b) => a.data.id - b.data.id,
  },
  {
    id: "analysis",
    label: "Analysis",
    comparator: (a, b) => a.data.name.localeCompare(b.data.name),
  },
  {
    id: "created",
    label: "Created",
    comparator: (a, b) =>
      new Date(a.data.creation_date).getTime() -
      new Date(b.data.creation_date).getTime(),
  },
  {
    id: "creator",
    label: "Creator",
    comparator: (a, b) =>
      a.data.owner_username.localeCompare(b.data.owner_username),
  },
  {
    id: "runtime",
    label: "Run Time",
    comparator: (_a, _b, detailsA, detailsB) => {
      const timeA = detailsA?.time || "0";
      const timeB = detailsB?.time || "0";
      return timeA.localeCompare(timeB);
    },
  },
  {
    id: "size",
    label: "Size",
    comparator: (_a, _b, detailsA, detailsB) => {
      const sizeA = detailsA?.size || "0";
      const sizeB = detailsB?.size || "0";
      return sizeA - sizeB;
    },
  },
  {
    id: "status",
    label: "Status",
    comparator: (_a, _b, detailsA, detailsB) => {
      const progressA = detailsA?.progress || 0;
      const progressB = detailsB?.progress || 0;
      return progressA - progressB;
    },
  },
];

const TableSelectable: React.FC = () => {
  const navigate = useNavigate();
  const { feedCount, loadingFeedState, feedsToDisplay, searchFolderData } =
    useFeedListData();
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const { perPage, page, type, search, searchType } = searchFolderData;
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] =
    useState<SortByDirection>(SortByDirection.desc);

  const feedQueries = useQueries({
    queries: feedsToDisplay.map((feed) => ({
      queryKey: ["feedDetails", feed.data.id],
      queryFn: async () => {
        const res = await getPluginInstanceDetails(feed);
        return { [feed.data.id]: { details: res } };
      },
      refetchInterval: (data: any) => {
        const state = data.state.data;
        const details = state?.[feed.data.id]?.details;
        if (!details) return false;
        if (details?.progress === 100 || details?.error === true) {
          return false; // Stop polling
        }
        return 2000; // Poll every 2 seconds
      },
    })),
  });

  const feedDetails = useMemo(() => {
    return Object.assign({}, ...feedQueries.map((query) => query.data || {}));
  }, [feedQueries]);

  const getSortParams = (columnIndex: number) => ({
    sortBy: {
      index: activeSortIndex as number,
      direction: activeSortDirection,
    },
    onSort: (
      _event: React.MouseEvent,
      index: number,
      direction: SortByDirection,
    ) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const sortedFeeds = useMemo(() => {
    if (activeSortIndex !== null && feedDetails) {
      const comparator = COLUMN_DEFINITIONS[activeSortIndex].comparator;
      return [...feedsToDisplay].sort((a, b) =>
        activeSortDirection === SortByDirection.asc
          ? comparator(
              a,
              b,
              feedDetails[a.data.id]?.details,
              feedDetails[b.data.id]?.details,
            )
          : comparator(
              b,
              a,
              feedDetails[b.data.id]?.details,
              feedDetails[a.data.id]?.details,
            ),
      );
    }
    return feedsToDisplay;
  }, [feedsToDisplay, activeSortIndex, activeSortDirection, feedDetails]);

  const onSetPage = (
    _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    navigate(
      `/feeds?search=${search}&searchType=${searchType}&page=${newPage}&perPage=${perPage}&type=${type}`,
    );
  };

  const onPerPageSelect = (
    _: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    navigate(
      `/feeds?search=${search}&searchType=${searchType}&page=${newPage}&perPage=${newPerPage}&type=${type}`,
    );
  };

  const handleFilterChange = debounce((search: string, searchType: string) => {
    navigate(`/feeds?search=${search}&searchType=${searchType}&type=${type}`);
  });

  const onExampleTypeChange: ToggleGroupItemProps["onChange"] = (event) => {
    const id = event.currentTarget.id;
    navigate(
      `/feeds?search=${search}&searchType=${searchType}&page=1&perPage=${perPage}&type=${id}`,
    );
  };

  useEffect(() => {
    if (!type || (!isLoggedIn && type === "private")) {
      navigate(
        `/feeds?search=${search}&searchType=${searchType}&page=${page}&perPage=${perPage}&type=public`,
      );
    }
  }, [isLoggedIn, navigate, perPage, page, searchType, search, type]);

  const generatePagination = (feedCount?: number) => {
    if (!feedCount && loadingFeedState) {
      return <Skeleton width="25%" screenreaderText="Loaded Feed Count" />;
    }

    return (
      <Pagination
        style={{
          marginTop: "0.5em",
        }}
        itemCount={feedCount}
        perPage={+perPage}
        page={+page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    );
  };

  return (
    <WrapperConnect>
      <PageSection style={{ paddingTop: "0.25em" }} className="feed-header">
        <div>
          <FeedSearch
            loading={loadingFeedState}
            search={search}
            searchType={searchType}
            onSearch={handleFilterChange}
          />
        </div>
        {generatePagination(feedCount)}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ToggleGroup
            style={{ marginRight: "0.5em" }}
            aria-label="Default with single selectable"
          >
            <ToggleGroupItem
              text="Private Feeds"
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
          <CreateFeedProvider>
            <PipelineProvider>
              <AddNodeProvider>
                <CreateFeed />
              </AddNodeProvider>
            </PipelineProvider>
          </CreateFeedProvider>
        </div>
      </PageSection>
      <PageSection style={{ paddingBlockStart: "0.5em", height: "100%" }}>
        <Operations
          origin={{
            type: OperationContext.FEEDS,
            additionalKeys: [perPage, page, type, search, searchType],
          }}
          customStyle={{
            toolbarItem: { paddingInlineStart: "0" },
            toolbar: {
              paddingTop: "0",
            },
          }}
        />
        {loadingFeedState ? (
          <LoadingTable />
        ) : feedsToDisplay.length > 0 ? (
          <Table
            className="feed-table"
            variant="compact"
            aria-label="Feed Table"
          >
            <Thead>
              <Tr>
                <Th />
                {COLUMN_DEFINITIONS.map((column, columnIndex) => (
                  <Th key={column.id} sort={getSortParams(columnIndex)}>
                    {column.label}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {sortedFeeds.map((feed, rowIndex) => (
                <TableRow
                  key={feed.data.id}
                  feed={feed}
                  rowIndex={rowIndex}
                  allFeeds={feedsToDisplay}
                  type={type}
                  additionalKeys={[perPage, page, type, search, searchType]}
                  details={feedDetails?.[feed.data.id]?.details}
                />
              ))}
            </Tbody>
          </Table>
        ) : (
          <EmptyStateTable />
        )}
      </PageSection>
    </WrapperConnect>
  );
};

export default TableSelectable;

interface TableRowProps {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  type: string;
  additionalKeys: string[];
  details: any;
}

const TableRow: React.FC<TableRowProps> = ({
  rowIndex,
  feed,
  additionalKeys,
  details,
}) => {
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  const navigate = useNavigate();
  const { isDarkTheme } = useContext(ThemeContext);
  const getFolderForThisFeed = async () => {
    const payload = await feed.getFolder();
    return payload;
  };
  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";
  const backgroundRow =
    details && details.progress < 100 && !details.error
      ? backgroundColor
      : "inherit";
  const isSelected =
    selectedPaths.length > 0 &&
    selectedPaths.some((payload) => payload.path === feed.data.folder_path);
  const selectedBgRow = isSelected ? backgroundColor : backgroundRow;

  const onFeedNameClick = () => {
    navigate(
      `/feeds/${feed.data.id}?type=${feed.data.public ? "public" : "private"}`,
    );
  };

  return (
    <FolderContextMenu
      origin={{
        type: OperationContext.FEEDS,
        additionalKeys: additionalKeys,
      }}
    >
      <Tr
        key={feed.data.id}
        style={{
          backgroundColor: selectedBgRow,
          cursor: "pointer",
        }}
        data-test-id={`${feed.data.name}-test`}
        onContextMenu={async (e) => {
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.data.folder_path, "folder");
        }}
        onClick={async (e) => {
          e?.stopPropagation();
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.data.folder_path, "folder", () => {
            onFeedNameClick();
          });
        }}
        isRowSelected={isSelected}
      >
        <Td
          onClick={(e) => e.stopPropagation()}
          select={{
            rowIndex: rowIndex,
            isSelected: isSelected,
            onSelect: async (event) => {
              event.stopPropagation();
              const isChecked = event.currentTarget.checked; // Capture the checked value before the async call
              const payload = await getFolderForThisFeed();

              // Create a new event object with the captured properties
              const newEvent = {
                ...event,
                stopPropagation: () => event.stopPropagation(),
                preventDefault: () => event.preventDefault(),
                currentTarget: { ...event.currentTarget, checked: isChecked },
              };

              // Pass the new event object to the handler function
              handlers.handleCheckboxChange(
                newEvent,
                feed.data.folder_path,
                payload,
                "folder",
              );
            },
          }}
        />
        <Td dataLabel="ID">{feed.data.id}</Td>

        <Td dataLabel="analysis">
          <FeedInfoColumn feed={feed} onClick={onFeedNameClick} />
        </Td>
        <Td dataLabel="created">
          {format(new Date(feed.data.creation_date), "dd MMM yyyy, HH:mm")}
        </Td>
        <Td dataLabel="creator">{feed.data.owner_username}</Td>
        <Td dataLabel="runtime">{details?.time}</Td>
        <Td dataLabel="size">
          {details?.size ? (
            formatBytes(details?.size, 0)
          ) : (
            <Skeleton width="100%" height="40px" />
          )}
        </Td>
        <Td dataLabel="status">
          <DonutUtilization details={details} />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

const DonutUtilization = (props: {
  details: any;
}) => {
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const { details } = props;

  if (!details) {
    return <div>N/A</div>;
  }
  let threshold = Number.POSITIVE_INFINITY;
  const { progress, error: feedError, feedProgressText } = details;
  let title = `${progress ? progress : 0}%`;
  let color = "blue";
  if (feedError) {
    color = "#ff0000";
    threshold = progress;
  }

  // If initial node in a feed fails
  if (progress === 0 && feedError) {
    color = "#00ff00";
    title = "❌";
  }
  // If progress less than 100%, display green
  if (progress < 100 && !feedError) {
    color = "#00ff00";
    threshold = progress;
  }
  if (progress === 100) {
    title = "✔️";
  }

  const mode = isDarkTheme ? "dark" : "light";

  return (
    <Tooltip content={`Progress: ${details.progress}%`}>
      <div className={`chart ${mode}`}>
        <ChartDonutUtilization
          ariaTitle={feedProgressText}
          data={{ x: "Analysis Progress", y: progress }}
          height={125}
          title={title}
          thresholds={[{ value: threshold, color: color }]}
          width={125}
        />
      </div>
    </Tooltip>
  );
};

const FeedInfoColumn = ({
  feed,
  onClick,
}: { feed: Feed; onClick: (feed: Feed) => void }) => (
  <Button
    variant="link"
    onClick={(e) => {
      e.stopPropagation();
      onClick(feed);
    }}
    style={{
      padding: 0,
    }}
  >
    {feed.data.name}
  </Button>
);

const COLUMN_ORDER = [
  { id: "id", label: "ID" },
  { id: "analysis", label: "Analysis" },
  { id: "created", label: "Created" },
  { id: "creator", label: "Creator" },
  { id: "runtime", label: "Run Time" },
  { id: "size", label: "Size" },
  { id: "status", label: "Status" },
];

function EmptyStateTable() {
  return (
    <Table variant="compact" aria-label="Empty Table">
      <Thead>
        <Tr>
          <Th />
          {COLUMN_ORDER.map(({ label }) => (
            <Th key={label}>{label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={COLUMN_ORDER.length + 1}>
            <EmptyState variant={EmptyStateVariant.full}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h4" size="lg">
                No Data Available
              </Title>
              <Paragraph>
                There are no analyses to display at this time. Please check back
                later or adjust your filters.
              </Paragraph>
            </EmptyState>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}

function LoadingTable() {
  return (
    <Table variant="compact" aria-label="Loading Table">
      <Thead>
        <Tr>
          <Th />
          {COLUMN_ORDER.map(({ label }) => (
            <Th key={label}>{label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: 15 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <Tr key={index}>
            <Td colSpan={COLUMN_ORDER.length + 1}>
              <Skeleton width="100%" height="40px" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
