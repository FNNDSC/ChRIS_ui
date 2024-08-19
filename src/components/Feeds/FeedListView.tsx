import type { Feed, FileBrowserFolder } from "@fnndsc/chrisapi";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import {
  Button,
  Checkbox,
  EmptyState,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  Pagination,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useTypedSelector } from "../../store/hooks";
import { setSidebarActive } from "../../store/ui/uiSlice";
import { AddNodeProvider } from "../AddNode/context";
import { Typography } from "../Antd";
import { InfoIcon } from "../Common";
import CreateFeed from "../CreateFeed/CreateFeed";
import { CreateFeedProvider } from "../CreateFeed/context";
import { ThemeContext } from "../DarkTheme/useTheme";
import { SearchIcon } from "../Icons";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import Operations, { ContextTypes } from "../NewLibrary/components/Operations";
import useLongPress from "../NewLibrary/utils/longpress";
import { PipelineProvider } from "../PipelinesCopy/context";
import WrapperConnect from "../Wrapper";
import { useSearchQueryParams } from "./usePaginate";
import {
  fetchFeeds,
  fetchPublicFeeds,
  getPluginInstanceDetails,
} from "./utilties";

const { Paragraph } = Typography;

const useSearchQuery = (query: URLSearchParams) => ({
  page: query.get("page") || "1",
  search: query.get("search") || "",
  searchType: query.get("searchType") || "name",
  perPage: query.get("perPage") || "15",
  type: query.get("type") || "public",
});

const TableSelectable: React.FC = () => {
  const queryClient = useQueryClient();
  const query = useSearchQueryParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchFolderData = useSearchQuery(query);
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const { perPage, page, type, search, searchType } = searchFolderData;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["feeds", perPage, page, type, search, searchType],
    queryFn: () => fetchFeeds(searchFolderData),
    enabled: type === "private" || isLoggedIn,
  });

  const {
    data: publicFeeds,
    isLoading: publicFeedLoading,
    isFetching: publicFeedFetching,
  } = useQuery({
    queryKey: ["publicFeeds", perPage, page, type, search, searchType],
    queryFn: () => fetchPublicFeeds(searchFolderData),
    enabled: type === "public" || !isLoggedIn,
  });

  const feedsToDisplay =
    type === "private" ? data?.feeds || [] : publicFeeds?.feeds || [];

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

  const handleFilterChange = (search: string, searchType: string) => {
    navigate(`/feeds?search=${search}&searchType=${searchType}&type=${type}`);
  };

  const onExampleTypeChange: ToggleGroupItemProps["onChange"] = (event) => {
    const id = event.currentTarget.id;
    navigate(
      `/feeds?search=${search}&searchType=${searchType}&page=1&perPage=${perPage}&type=${id}`,
    );
  };

  useEffect(() => {
    document.title = "All Analyses - ChRIS UI ";
    dispatch(setSidebarActive({ activeItem: "analyses" }));
  }, [dispatch]);

  useEffect(() => {
    if (!type || (!isLoggedIn && type === "private")) {
      navigate(
        `/feeds?search=${search}&searchType=${searchType}&page=${page}&perPage=${perPage}&type=public`,
      );
    }
  }, [isLoggedIn, navigate, perPage, page, searchType, search, type]);

  const columnNames = {
    id: "ID",
    analysis: "Analysis",
    created: "Created",
    creator: "Creator",
    runtime: "Run Time",
    size: "Size",
    status: "Status",
  };

  const feedCount =
    type === "private" ? data?.totalFeedsCount : publicFeeds?.totalFeedsCount;

  const loadingFeedState =
    isLoading || isFetching || publicFeedLoading || publicFeedFetching;

  const inValidateFolders = () => {
    queryClient.invalidateQueries({
      queryKey: ["feeds"],
    });
  };

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
      <PageSection className="feed-header">
        <div>
          <InfoIcon
            data-test-id="analysis-count"
            title={`New and Existing Analyses (${
              !feedCount && loadingFeedState
                ? "Fetching..."
                : feedCount === -1
                  ? 0
                  : feedCount
            })`}
            p1={
              <Paragraph>
                Analyses (aka ChRIS feeds) are computational experiments where
                data are organized and processed by ChRIS plugins. In this view
                you may view your analyses and also the ones shared with you.
              </Paragraph>
            }
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
          inValidateFolders={inValidateFolders}
          customStyle={{ toolbarItem: { paddingInlineStart: "0" } }}
          context={ContextTypes.feed_table}
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
                {Object.values(columnNames).map((name) => (
                  <Th key={name}>{name}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {feedsToDisplay.map((feed, rowIndex) => (
                <TableRow
                  key={feed.data.id}
                  feed={feed}
                  rowIndex={rowIndex}
                  columnNames={columnNames}
                  allFeeds={feedsToDisplay}
                  type={type}
                  inValidateFolders={inValidateFolders}
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
  columnNames: {
    id: string;
    analysis: string;
    created: string;
    creator: string;
    runtime: string;
    size: string;
    status: string;
  };
  type: string;
  inValidateFolders: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
  feed,
  columnNames,
  inValidateFolders,
}) => {
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  const navigate = useNavigate();
  const [intervalMs, setIntervalMs] = useState(2000);
  const { isDarkTheme } = useContext(ThemeContext);

  const { data } = useQuery({
    queryKey: ["feedResources", feed],
    queryFn: async () => {
      try {
        const res = await getPluginInstanceDetails(feed);
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

  const getFolderForThisFeed = async () => {
    const payload = await feed.getFolder();
    return payload;
  };

  const details = data?.[feed.data.id].details;
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
      inValidateFolders={inValidateFolders}
      context={ContextTypes.feed_table}
    >
      <Tr
        key={feed.data.id}
        style={{
          backgroundColor: selectedBgRow,
        }}
        data-test-id={`${feed.data.name}-test`}
        onContextMenu={async (e) => {
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.data.folder_path, "folder");
        }}
        onClick={async (e) => {
          const payload = await getFolderForThisFeed();
          handleOnClick(e, payload, feed.data.folder_path, "folder");
        }}
      >
        <Td>
          <BulkCheckbox
            feed={feed}
            getFolderForThisFeed={getFolderForThisFeed}
            isSelected={isSelected}
          />
        </Td>
        <Td dataLabel={columnNames.id}>{feed.data.id}</Td>
        <Td dataLabel={columnNames.analysis}>
          <FeedInfoColumn feed={feed} onClick={onFeedNameClick} />
        </Td>
        <Td dataLabel={columnNames.created}>
          {format(new Date(feed.data.creation_date), "dd MMM yyyy, HH:mm")}
        </Td>
        <Td dataLabel={columnNames.creator}>{feed.data.owner_username}</Td>
        <Td dataLabel={columnNames.runtime}>
          {data?.[feed.data.id].details.time}
        </Td>
        <Td dataLabel={columnNames.size}>
          {data?.[feed.data.id].details.size}
        </Td>
        <Td dataLabel={columnNames.status}>
          <DonutUtilization details={data?.[feed.data.id].details} />
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

const BulkCheckbox = ({
  feed,
  getFolderForThisFeed,
  isSelected,
}: {
  feed: Feed;
  getFolderForThisFeed: () => Promise<FileBrowserFolder>;
  isSelected: boolean;
}) => {
  const { handlers } = useLongPress();
  const handleCheckboxChange = handlers.handleCheckboxChange;

  return (
    <Checkbox
      className={`${feed.data.name}-checkbox`}
      isChecked={isSelected}
      id={feed.data.id}
      aria-label={`${feed.data.name}-checkbox`}
      onClick={(e) => e.stopPropagation()}
      onChange={async (event) => {
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
        handleCheckboxChange(
          newEvent,
          feed.data.folder_path,
          payload,
          "folder",
        );
      }}
    />
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
