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
import {
  SortByDirection,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { debounce } from "lodash";
import type React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { AddNodeProvider } from "../AddNode/context";
import { Typography } from "../Antd";
import { InfoSection } from "../Common";
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
import { fetchPublicFeed, getPluginInstanceDetails } from "./utilties";

const { Paragraph } = Typography;

interface ColumnDefinition {
  id: string;
  label: string;
  comparator: (a: Feed, b: Feed, detailsA: any, detailsB: any) => number;
}

// We remove 'runtime' + 'size' columns
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

  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const { perPage, page, type, search, searchType } = searchFolderData;

  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] =
    useState<SortByDirection>(SortByDirection.desc);

  // 1) Use Queries => each feed returns an object { [feedId]: details }
  //    Then we merge them into one dictionary feedDetails.
  const feedQueries = useQueries({
    queries: feedsToDisplay.map((feed) => ({
      queryKey: ["feedDetails", feed.data.id],
      queryFn: async () => {
        const client = ChrisAPIClient.getClient();
        let updatedFeed = null;
        // Choose the appropriate feed fetch function based on type
        if (type === "public") {
          updatedFeed = await fetchPublicFeed(feed.data.id);
        } else if (type === "private") {
          updatedFeed = await client.getFeed(feed.data.id);
        } else {
          // If no valid type is provided, default to null
          return { [feed.data.id]: null };
        }
        if (!updatedFeed) return { [feed.data.id]: null };
        const res = await getPluginInstanceDetails(updatedFeed);
        return { [feed.data.id]: res };
      },
      refetchInterval: (result: any) => {
        const data = result.state.data;
        // Stop polling if an error occurs
        if (result.state.error) return false;
        // Stop polling if no feed is returned
        if (data && data[feed.data.id] === null) return false;
        // Stop polling if progress is 100
        if (data && data[feed.data.id]?.progress === 100) return false;
        // Otherwise poll every 2 seconds
        return 2000;
      },
    })),
  });

  // 2) Merge each returned object into a single dictionary
  const feedDetails = useMemo(() => {
    // e.g. feedQueries[i].data => { 3: { progress: 50, feedProgressText: ... } }
    // We flatten them all into { 3: {...}, 5: {...}, etc. }
    return Object.assign({}, ...feedQueries.map((query) => query.data || {}));
  }, [feedQueries]);

  // 3) Sorting
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

  // 4) Produce sorted feeds
  const sortedFeeds = useMemo(() => {
    if (activeSortIndex !== null && feedDetails) {
      const comparator = COLUMN_DEFINITIONS[activeSortIndex].comparator;
      return [...feedsToDisplay].sort((a, b) =>
        activeSortDirection === SortByDirection.asc
          ? comparator(a, b, feedDetails[a.data.id], feedDetails[b.data.id])
          : comparator(b, a, feedDetails[b.data.id], feedDetails[a.data.id]),
      );
    }
    return feedsToDisplay;
  }, [feedsToDisplay, activeSortIndex, activeSortDirection, feedDetails]);

  // 5) Pagination
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

  // 6) If user is not logged in + type=private => redirect to public
  useEffect(() => {
    if (!type || (!isLoggedIn && type === "private")) {
      navigate(
        `/feeds?search=${search}&searchType=${searchType}&page=${page}&perPage=${perPage}&type=public`,
      );
    }
  }, [isLoggedIn, navigate, perPage, page, searchType, search, type]);

  // 7) Show pagination or skeleton
  const generatePagination = (count?: number) => {
    if (!count && loadingFeedState) {
      return <Skeleton width="25%" screenreaderText="Loaded Feed Count" />;
    }

    return (
      <Pagination
        style={{
          marginTop: "0.5em",
        }}
        itemCount={count}
        perPage={+perPage}
        page={+page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        isCompact
        aria-label="Feed table pagination"
      />
    );
  };

  const feedCountText =
    !feedCount && loadingFeedState
      ? "Fetching..."
      : feedCount === -1
        ? 0
        : feedCount;

  const TitleComponent = (
    <InfoSection
      title={`New and Existing Analyses (${feedCountText})`}
      content="Analyses (aka ChRIS feeds) are computational experiments where data
      are organized and processed by ChRIS plugins. In this view, you may
      view your analyses and also the ones shared with you."
    />
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      <PageSection
        stickyOnBreakpoint={{ default: "top" }}
        style={{ paddingTop: "0.25em", paddingBottom: "0" }}
      >
        <div className="feed-header">
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
        </div>

        {isLoggedIn && (
          <Operations
            origin={{
              type: OperationContext.FEEDS,
              additionalKeys: [perPage, page, type, search, searchType],
            }}
            customStyle={{
              toolbarItem: { paddingInlineStart: "0" },
              toolbar: {
                paddingTop: "0",
                paddingBottom: "0",
                background: "inherit",
              },
            }}
          />
        )}
      </PageSection>
      <PageSection style={{ paddingBlockStart: "0.5em" }}>
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
                <Th scope="col" screenReaderText="Select Feed" />
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
                  details={feedDetails[feed.data.id]}
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

// -------------- TableRow Props --------------
interface TableRowProps {
  rowIndex: number;
  feed: Feed;
  allFeeds: Feed[];
  type: string;
  additionalKeys: string[];
  details: any;
}

// -------------- TableRow --------------
const TableRow: React.FC<TableRowProps> = ({
  rowIndex,
  feed,
  additionalKeys,
  details,
}) => {
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
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

  const isSelected = selectedPaths.some(
    (payload) => payload.path === feed.data.folder_path,
  );
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
        style={{ backgroundColor: selectedBgRow, cursor: "pointer" }}
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
              const isChecked = event.currentTarget.checked; // Capture the checked value
              const payload = await getFolderForThisFeed();

              // Create a new event object
              const newEvent = {
                ...event,
                stopPropagation: () => event.stopPropagation(),
                preventDefault: () => event.preventDefault(),
                currentTarget: { ...event.currentTarget, checked: isChecked },
              };

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
        {/* We removed the "runtime" + "size" columns */}
        <Td dataLabel="status">
          <DonutUtilization details={details} />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

// -------------- DonutUtilization --------------
const DonutUtilization = ({ details }: { details: any }) => {
  const { isDarkTheme } = useContext(ThemeContext);

  if (!details) {
    return <div>N/A</div>;
  }

  const { progress = 0, foundError, feedProgressText } = details;

  let title = `${progress}%`;
  let color = "#0066cc";
  let threshold = 100;

  if (foundError) {
    color = "#ff0000"; // red for errors
    threshold = progress;
  } else if (progress === 100) {
    title = "✔️";
  } else {
    color = "#00ff00"; // green in-progress
    threshold = progress;
  }

  const mode = isDarkTheme ? "dark" : "light";

  return (
    <Tooltip content={`Progress: ${progress}%`}>
      <div className={`chart ${mode}`}>
        <ChartDonutUtilization
          ariaTitle={feedProgressText}
          data={{ x: "Analysis", y: progress }}
          labels={() => null}
          height={125}
          title={title}
          thresholds={[{ value: threshold, color }]}
          width={125}
        />
      </div>
    </Tooltip>
  );
};

// -------------- FeedInfoColumn --------------
const FeedInfoColumn = ({
  feed,
  onClick,
}: {
  feed: Feed;
  onClick: (feed: Feed) => void;
}) => (
  <Button
    variant="link"
    onClick={(e) => {
      e.stopPropagation();
      onClick(feed);
    }}
    style={{ padding: 0 }}
    aria-label={`View details for ${feed.data.name}`}
  >
    {feed.data.name}
  </Button>
);

// -------------- Column Order for Skeleton, etc. --------------
const COLUMN_ORDER = [
  { id: "id", label: "ID" },
  { id: "analysis", label: "Analysis" },
  { id: "created", label: "Created" },
  { id: "creator", label: "Creator" },
  { id: "status", label: "Status" },
];

// -------------- EmptyStateTable --------------
function EmptyStateTable() {
  return (
    <Table variant="compact" aria-label="Empty Table">
      <Thead>
        <Tr>
          <Th />
          {COLUMN_ORDER.map(({ label }) => (
            <Th scope="col" key={label}>
              {label}
            </Th>
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

// -------------- LoadingTable --------------
function LoadingTable() {
  return (
    <Table variant="compact" aria-label="Loading Table">
      <Thead>
        <Tr>
          <Th screenReaderText="loading data" />
          {COLUMN_ORDER.map(({ label }) => (
            <Th key={label}>{label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: 20 }).map((_, index) => (
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
