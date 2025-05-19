import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Skeleton, Tooltip } from "@patternfly/react-core";
import { format } from "date-fns";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { formatBytes } from "../Feeds/utilties";
import FileDetailView from "../Preview/FileDetailView";
import { Drawer, Tag } from "antd";
import { OperationContext } from "../NewLibrary/context";
import useLongPress, { useAssociatedFeed } from "../NewLibrary/utils/longpress";
import useNewResourceHighlight from "../NewLibrary/utils/useNewResourceHighlight";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import {
  getFileName,
  getLinkFileName,
} from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import { useAppSelector } from "../../store/hooks";
import styles from "./gnome.module.css";
import {
  FolderIcon,
  FileIcon,
  ExternalLinkSquareAltIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
  FolderOpenIcon,
} from "@patternfly/react-icons";
import GnomeBulkActionBar from "./GnmoreActionBar";

interface TableProps {
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
  handleFolderClick: (folderName: string) => void;
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
}

interface RowProps {
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
}

export const GnomeBaseRow: React.FC<RowProps> = ({
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
}) => {
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
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

  const path =
    type === "folder" || type === "link"
      ? resource.data.path
      : resource.data.fname;

  const handleItem = () => {
    if (type === "folder") {
      handleFolderClick();
    } else {
      handleFileClick();
    }
  };

  return (
    <FolderContextMenu origin={origin} key={path} computedPath={computedPath}>
      <li
        ref={scrollToNewResource}
        className={isSelected ? styles.selectedItem : ""}
      >
        <Button
          variant="plain"
          className={`${styles.fileListItem} ${styles.fileListButton}`}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick(e, resource, path, type, () => {
              handleItem();
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOnClick(e, resource, path, type, () => {
                handleItem();
              });
            }
          }}
          onContextMenu={(e) => {
            handleOnClick(e, resource, path, type);
          }}
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
    </FolderContextMenu>
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

export const GnomeLinkRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <GnomeBaseRow {...props} type="link" />
);

const GnomeLibraryTable: React.FC<TableProps> = ({
  data,
  computedPath,
  handleFolderClick,
  fetchMore,
  handlePagination,
  filesLoading,
}) => {
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

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handlePagination || !fetchMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && fetchMore && !filesLoading) {
          handlePagination();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchMore, handlePagination, filesLoading]);

  const handleFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleSort = (columnIndex: number) => {
    setSortBy((prevSortBy) => {
      const newDirection =
        prevSortBy.index === columnIndex && prevSortBy.direction === "asc"
          ? "desc"
          : "asc";
      return { index: columnIndex, direction: newDirection };
    });
  };

  const sortRows = () => {
    const sortedData = { ...data };
    const { index, direction } = sortBy;

    if (index === 0) {
      // Name column
      sortedData.folders.sort(
        (a, b) =>
          getFolderName(a, computedPath).localeCompare(
            getFolderName(b, computedPath),
          ) * (direction === "asc" ? 1 : -1),
      );
      sortedData.files.sort(
        (a, b) =>
          getFileName(a).localeCompare(getFileName(b)) *
          (direction === "asc" ? 1 : -1),
      );
      sortedData.linkFiles.sort(
        (a, b) =>
          getLinkFileName(a).localeCompare(getLinkFileName(b)) *
          (direction === "asc" ? 1 : -1),
      );
    } else if (index === 1) {
      // Date column
      sortedData.folders.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.files.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
      sortedData.linkFiles.sort((a, b) => {
        const dateA = new Date(a.data.creation_date).getTime();
        const dateB = new Date(b.data.creation_date).getTime();
        return (dateA - dateB) * (direction === "asc" ? 1 : -1);
      });
    } else if (index === 2) {
      // Owner column
      sortedData.folders.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) *
          (direction === "asc" ? 1 : -1),
      );
      sortedData.files.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) *
          (direction === "asc" ? 1 : -1),
      );
      sortedData.linkFiles.sort(
        (a, b) =>
          a.data.owner_username.localeCompare(b.data.owner_username) *
          (direction === "asc" ? 1 : -1),
      );
    } else if (index === 3) {
      // Size column
      sortedData.folders.sort(
        () => 0, // Folders don't have size, so no sorting
      );
      sortedData.files.sort(
        (a, b) =>
          (a.data.fsize - b.data.fsize) * (direction === "asc" ? 1 : -1),
      );
      sortedData.linkFiles.sort(
        (a, b) =>
          (a.data.fsize - b.data.fsize) * (direction === "asc" ? 1 : -1),
      );
    }

    return sortedData;
  };

  // Apply sorting to the data
  const sortedData = sortBy.index !== null ? sortRows() : data;

  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };

  // Helper function to render sort icon
  const renderSortIcon = (columnIndex: number) => {
    if (sortBy.index === columnIndex) {
      return sortBy.direction === "asc" ? (
        <SortAmountUpIcon className={styles.sortIcon} />
      ) : (
        <SortAmountDownIcon className={styles.sortIcon} />
      );
    }
    // Show a neutral sort icon for columns that are not currently sorted
    return <SortAmountDownIcon className={styles.inactiveSortIcon} />;
  };

  return (
    <React.Fragment>
      <Drawer
        width="100%"
        open={preview}
        closable={true}
        onClose={() => {
          setShowPreview(false);
          setSelectedFile(undefined);
        }}
        placement="right"
      >
        {selectedFile && (
          <FileDetailView selectedFile={selectedFile} preview="large" />
        )}
      </Drawer>

      <div className={styles.fileListContainer}>
        {/* Loading indicator at the top when fetching data */}
        {filesLoading && (
          <div className={styles.loadingIndicator}>
            <Skeleton height="20px" width="20px" shape="circle" />
            <span className={styles.loadingText}>Loading items...</span>
          </div>
        )}

        <div className={styles.fileListHeader}>
          <div
            className={`${styles.fileNameHeader} ${styles.clickableHeader}`}
            onClick={() => handleSort(0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSort(0);
              }
            }}
            aria-label="Sort by name"
          >
            Name {renderSortIcon(0)}
          </div>
          <div
            className={`${styles.fileDateHeader} ${styles.clickableHeader}`}
            onClick={() => handleSort(1)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSort(1);
              }
            }}
            aria-label="Sort by creation date"
          >
            Created {renderSortIcon(1)}
          </div>
          {origin.type !== "fileBrowser" && (
            <div
              className={`${styles.fileOwnerHeader} ${styles.clickableHeader}`}
              onClick={() => handleSort(2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSort(2);
                }
              }}
              aria-label="Sort by creator"
            >
              Creator {renderSortIcon(2)}
            </div>
          )}
          <div
            className={`${styles.fileSizeHeader} ${styles.clickableHeader}`}
            onClick={() => handleSort(3)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSort(3);
              }
            }}
            aria-label="Sort by size"
          >
            Size {renderSortIcon(3)}
          </div>
        </div>

        {/* Empty state when no data is available */}
        {!filesLoading &&
        sortedData.folders.length === 0 &&
        sortedData.files.length === 0 &&
        sortedData.linkFiles.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <FolderOpenIcon className={styles.emptyStateIcon} />
            <h2 className={styles.emptyStateTitle}>No items found</h2>
            <p className={styles.emptyStateText}>
              This folder is empty. Upload files or create a new folder to get
              started.
            </p>
          </div>
        ) : (
          <ul className={styles.fileList}>
            {sortedData.folders.map((resource: FileBrowserFolder, index) => (
              <GnomeFolderRow
                rowIndex={index}
                key={resource.data.path}
                resource={resource}
                name={getFolderName(resource, computedPath)}
                date={resource.data.creation_date}
                owner={resource.data.owner_username}
                size={0}
                computedPath={computedPath}
                handleFolderClick={() => {
                  const name = getFolderName(resource, computedPath);
                  handleFolderClick(name);
                }}
                handleFileClick={() => {
                  return;
                }}
                origin={origin}
              />
            ))}
            {sortedData.files.map((resource: FileBrowserFolderFile, index) => (
              <GnomeFileRow
                rowIndex={index}
                key={resource.data.fname}
                resource={resource}
                name={getFileName(resource)}
                date={resource.data.creation_date}
                owner={resource.data.owner_username}
                size={resource.data.fsize}
                computedPath={computedPath}
                handleFolderClick={() => {
                  return;
                }}
                handleFileClick={() => {
                  handleFileClick(resource);
                }}
                origin={origin}
              />
            ))}
            {sortedData.linkFiles.map(
              (resource: FileBrowserFolderLinkFile, index) => (
                <GnomeLinkRow
                  rowIndex={index}
                  key={resource.data.path}
                  resource={resource}
                  name={getLinkFileName(resource)}
                  date={resource.data.creation_date}
                  owner={resource.data.owner_username}
                  size={resource.data.fsize}
                  computedPath={computedPath}
                  handleFolderClick={() => {
                    return;
                  }}
                  handleFileClick={() => {
                    navigate(resource.data.path);
                  }}
                  origin={origin}
                />
              ),
            )}
          </ul>
        )}

        {/* Pagination section */}
        {fetchMore && (
          <div ref={observerTarget} className={styles.paginationContainer}>
            {filesLoading ? (
              <Skeleton height="30px" width="120px" />
            ) : (
              <Button
                onClick={handlePagination}
                variant="link"
                isDisabled={filesLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePagination?.();
                  }
                }}
                aria-label="Load more"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Bulk Action Bar with updated props */}
      <GnomeBulkActionBar origin={origin} computedPath={computedPath} />
    </React.Fragment>
  );
};

export default GnomeLibraryTable;
