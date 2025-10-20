import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  FileBrowserFolder,
  FileBrowserFolderFile,
  type FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Checkbox, Skeleton, Spinner } from "@patternfly/react-core";
import {
  AngleDownIcon,
  ExternalLinkSquareAltIcon,
  FileIcon,
  FolderIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from "@patternfly/react-icons";
import { Drawer, notification, Tag } from "antd";
import { format } from "date-fns";
import type React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as DoUser from "../../reducers/user";
import {
  clearSelectedPaths,
  setSelectedPaths,
} from "../../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { formatBytes } from "../Feeds/utilties";
import {
  getFileName,
  getLinkFileName,
} from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import { OperationContext } from "../NewLibrary/context";
import { useAssociatedFeed } from "../NewLibrary/utils/longpress";
import useNewResourceHighlight from "../NewLibrary/utils/useNewResourceHighlight";
import FileDetailView from "../Preview/FileDetailView";
import GnomeBulkActionBar from "./GnomeActionBar";
import { GnomeContextMenu } from "./GnomeContextMenu";
import styles from "./gnome.module.css";
import { useInfiniteScroll } from "./utils/hooks/useInfiniteScroll";

type RowProps = {
  rowIndex: number;
  key: string;
  resource:
    | FileBrowserFolder
    | FileBrowserFolderFile
    | FileBrowserFolderLinkFile;
  name: string;
  date: string;
  owner: string;
  size: number;
  type: "folder" | "file" | "link";
  computedPath: string;
  handleFolderClick: () => void;
  handleFileClick: () => void;
  origin: {
    type: OperationContext;
    additionalKeys: string[];
  };

  username: string;
};

export const GnomeBaseRow = (props: RowProps) => {
  const {
    resource,
    name,
    date,
    owner,
    size,
    type,
    computedPath,
    handleFolderClick,
    handleFileClick,
    origin,
    rowIndex,
    username,
  } = props;

  // Redux dispatch for selection management
  const dispatch = useAppDispatch();
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const { isNewResource, scrollToNewResource } = useNewResourceHighlight(date);
  const isSelected = selectedPaths.some((payload) => {
    if (type === "folder" || type === "link") {
      return payload.path === resource.data.path;
    }
    if (type === "file") {
      return payload.path === resource.data.fname;
    }
    return false;
  });

  const pathForCart =
    type === "folder" || type === "link"
      ? resource.data.path
      : resource.data.fname;

  const toggleSelection = () => {
    if (isSelected) {
      dispatch(clearSelectedPaths(pathForCart));
    } else {
      dispatch(
        setSelectedPaths({ path: pathForCart, type, payload: resource }),
      );
    }
  };

  const handleRowClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // Stop propagation to prevent other handlers from firing
    e.stopPropagation();

    // Handle ctrl+click for selection
    if (e.ctrlKey) {
      toggleSelection();
    } else {
      // Otherwise navigate
      if (type === "folder") {
        handleFolderClick();
      } else {
        handleFileClick();
      }
    }
  };

  // Handle context menu events
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // Select the item that was right-clicked if not already selected
    if (!isSelected) {
      dispatch(
        setSelectedPaths({ path: pathForCart, type, payload: resource }),
      );
    }
  };

  return (
    <GnomeContextMenu
      username={username}
      origin={origin}
      computedPath={computedPath}
    >
      <li
        key={pathForCart}
        ref={scrollToNewResource}
        className={`${styles.fileListRow} ${isSelected ? styles.selectedItem : ""}`}
      >
        <div className={styles.checkboxCell}>
          <div className={styles.checkboxWrapper}>
            <Checkbox
              id={`select-${type}-${rowIndex}`}
              aria-label="Select row"
              isChecked={isSelected}
              className={`${styles.largeCheckbox} ${styles.checkboxAlign}`}
              onChange={() => {
                toggleSelection();
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
          </div>
        </div>
        <Button
          variant="plain"
          className={`${styles.fileListItem} ${styles.fileListButton}`}
          onClick={handleRowClick}
          onContextMenu={handleContextMenu}
          aria-label={`${name} ${type}`}
        >
          <div className={styles.fileName}>
            {type === "folder" ? (
              <FolderIcon />
            ) : type === "link" ? (
              <ExternalLinkSquareAltIcon />
            ) : (
              <FileIcon />
            )}
            <span className={styles.fileNameText} title={name}>
              {name}
            </span>
            {isNewResource && (
              <span className={styles.newlyAddedTag}>
                <Tag color="#3E8635">Newly Added</Tag>
              </span>
            )}
          </div>
          <div
            className={styles.fileDate}
            title={format(new Date(date), "dd MMM yyyy, HH:mm")}
          >
            {format(new Date(date), "dd MMM yyyy, HH:mm")}
          </div>
          {origin.type !== "fileBrowser" && (
            <div className={styles.fileOwner} title={owner}>
              {owner}
            </div>
          )}
          <div
            className={styles.fileSize}
            title={size > 0 ? formatBytes(size, 0) : " "}
          >
            {size > 0 ? formatBytes(size, 0) : " "}
          </div>
        </Button>
      </li>
    </GnomeContextMenu>
  );
};

export const GnomeFolderRow: React.FC<Omit<RowProps, "type">> = (props) => {
  const { data, isLoading } = useAssociatedFeed(props.name);
  if (isLoading) {
    return (
      <li className={styles.fileListItem}>
        <Skeleton width="100%" />
      </li>
    );
  }
  return (
    <GnomeBaseRow {...props} name={data ? data : props.name} type="folder" />
  );
};

export const GnomeFileRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <GnomeBaseRow {...props} type="file" />
);

type GnomeLinkRowProps = Omit<RowProps, "type">;
export const GnomeLinkRow = (props: GnomeLinkRowProps) => (
  <GnomeBaseRow {...props} type="link" />
);

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  data: {
    folders: FileBrowserFolder[];
    files: FileBrowserFolderFile[];
    linkFiles: FileBrowserFolderLinkFile[];
    filesPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
    foldersPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
    linksPagination?: {
      totalCount: number;
      hasNextPage: boolean;
    };
  };
  computedPath: string;
  handleFolderClick: (folder: FileBrowserFolder) => void;
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const {
    data,
    computedPath,
    handleFolderClick,
    fetchMore,
    handlePagination,
    filesLoading,

    useUser,
  } = props;
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username } = user;

  const navigate = useNavigate();
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();
  const [sortBy, setSortBy] = useState<{
    index: number;
    direction: "asc" | "desc";
  }>({
    index: 0,
    direction: "asc",
  });

  // ref to the scrolling <ul>
  const listRef = useRef<HTMLUListElement>(null);

  // Use our custom infinite scroll hook
  const { sentinelRef, isNearBottom } = useInfiniteScroll({
    onLoadMore: handlePagination || (() => {}),
    hasMore: !!fetchMore,
    isLoading: !!filesLoading,
    root: listRef, // Pass the ref directly, the hook will handle it
    threshold: 200, // Load more when within 200px of the bottom
    loadingDelay: 300, // Wait 300ms after loading before allowing another fetch
  });

  const onFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  // Handle clicks on link entries: resolve to folder or file
  const onLinkClick = async (resource: FileBrowserFolderLinkFile) => {
    try {
      const linked = await resource.getLinkedResource();
      // folder link
      if (
        linked &&
        "path" in linked.data &&
        linked instanceof FileBrowserFolder
      ) {
        navigate(`/library/${linked.data.path}`);
      }
      // file link
      else if (
        linked &&
        "fname" in linked.data &&
        linked instanceof FileBrowserFolderFile
      ) {
        setSelectedFile(linked);
        setShowPreview(true);
      }
    } catch (err) {
      notification.error({
        message: "Error accessing link",
        description: "Could not open the linked resource.",
      });
    }
  };

  const onSort = (columnIndex: number) => {
    setSortBy((prev) => ({
      index: columnIndex,
      direction:
        prev.index === columnIndex && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortRows = () => {
    const sorted = { ...data };
    const { index, direction } = sortBy;
    const dir = direction === "asc" ? 1 : -1;

    if (index === 0) {
      sorted.folders.sort(
        (a, b) =>
          getFolderName(a, computedPath).localeCompare(
            getFolderName(b, computedPath),
          ) * dir,
      );
      sorted.files.sort(
        (a, b) => getFileName(a).localeCompare(getFileName(b)) * dir,
      );
      sorted.linkFiles.sort(
        (a, b) => getLinkFileName(a).localeCompare(getLinkFileName(b)) * dir,
      );
    } else if (index === 1) {
      sorted.folders.sort(
        (a, b) =>
          (new Date(a.data.creation_date).getTime() -
            new Date(b.data.creation_date).getTime()) *
          dir,
      );
      sorted.files.sort(
        (a, b) =>
          (new Date(a.data.creation_date).getTime() -
            new Date(b.data.creation_date).getTime()) *
          dir,
      );
      sorted.linkFiles.sort(
        (a, b) =>
          (new Date(a.data.creation_date).getTime() -
            new Date(b.data.creation_date).getTime()) *
          dir,
      );
    } else if (index === 2) {
      sorted.folders.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) * dir,
      );
      sorted.files.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) * dir,
      );
      sorted.linkFiles.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) * dir,
      );
    } else if (index === 3) {
      sorted.files.sort((a, b) => (a.data.fsize - b.data.fsize) * dir);
      sorted.linkFiles.sort((a, b) => (a.data.fsize - b.data.fsize) * dir);
    }

    return sorted;
  };

  const sortedData = sortBy.index !== null ? sortRows() : data;

  // origin for operations
  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };

  return (
    <>
      <Drawer
        width="100%"
        open={preview}
        closable
        onClose={() => {
          setShowPreview(false);
          setSelectedFile(undefined);
        }}
        placement="right"
      >
        {selectedFile && (
          <FileDetailView
            selectedFile={selectedFile}
            preview="large"
            useUser={useUser}
          />
        )}
      </Drawer>

      <div className={styles.fileListContainer}>
        <div className={styles.fileListHeader}>
          {/* Checkbox header */}
          <div className={styles.fileCheckboxHeader} />
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileNameHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(0);
              }
            }}
            aria-label="Sort by name"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Name</span>
              {sortBy.index === 0 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileDateHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(1);
              }
            }}
            aria-label="Sort by creation date"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Created</span>
              {sortBy.index === 1 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileOwnerHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(2)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(2);
              }
            }}
            aria-label="Sort by creator"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Creator</span>
              {sortBy.index === 2 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
          <div
            className={`${styles.fileSizeHeader} ${styles.clickableHeader}`}
            onClick={() => onSort(3)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(3);
              }
            }}
            aria-label="Sort by size"
          >
            <div className={styles.columnHeaderContent}>
              <span className={styles.columnHeaderText}>Size</span>
              {sortBy.index === 3 ? (
                sortBy.direction === "asc" ? (
                  <SortAmountUpIcon />
                ) : (
                  <SortAmountDownIcon />
                )
              ) : (
                <SortAmountDownIcon className={styles.inactiveSortIcon} />
              )}
            </div>
          </div>
        </div>

        <ul ref={listRef} className={styles.fileList}>
          {sortedData.folders.map((r, i) => (
            <GnomeFolderRow
              key={r.data.path}
              rowIndex={i}
              resource={r}
              name={getFolderName(r, computedPath)}
              date={r.data.creation_date}
              owner={r.data.owner_username}
              size={0}
              computedPath={computedPath}
              handleFolderClick={() => handleFolderClick(r)}
              handleFileClick={() => {}}
              origin={origin}
              username={username}
            />
          ))}

          {sortedData.files.map((r, i) => (
            <GnomeFileRow
              key={r.data.fname}
              rowIndex={i}
              resource={r}
              name={getFileName(r)}
              date={r.data.creation_date}
              owner={r.data.owner_username}
              size={r.data.fsize}
              computedPath={computedPath}
              handleFolderClick={() => {}}
              handleFileClick={() => onFileClick(r)}
              origin={origin}
              username={username}
            />
          ))}

          {sortedData.linkFiles.map((r, i) => (
            <GnomeLinkRow
              key={r.data.path}
              rowIndex={i}
              resource={r}
              name={getLinkFileName(r)}
              date={r.data.creation_date}
              owner={r.data.owner_username}
              size={r.data.fsize}
              computedPath={computedPath}
              handleFolderClick={() => {}}
              handleFileClick={() => onLinkClick(r)}
              origin={origin}
              username={username}
            />
          ))}
          {/* Sentinel element for infinite scrolling */}
          <li
            ref={sentinelRef as React.RefObject<HTMLLIElement>}
            style={{ height: "1px", opacity: 0 }}
          />
        </ul>

        {/* Loading indicator - always present with fixed height to prevent layout shift */}
        <div className={styles.loadingContainer}>
          {filesLoading && (
            <>
              <Spinner size="md" />
              <span>Loading more files...</span>
            </>
          )}
          {/* Show scroll indicator when near bottom and not loading */}
          {isNearBottom && fetchMore && !filesLoading && (
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation>
            <div
              className={styles.scrollIndicator}
              aria-label="Continue scrolling to load more items"
            >
              <div className={styles.scrollArrow}>
                <AngleDownIcon />
              </div>
              <span>Continue scrolling to load more</span>
            </div>
          )}
        </div>
      </div>

      <GnomeBulkActionBar
        origin={origin}
        computedPath={computedPath}
        username={username}
      />
    </>
  );
};
