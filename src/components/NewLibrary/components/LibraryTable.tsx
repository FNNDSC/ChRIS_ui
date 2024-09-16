import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Skeleton } from "@patternfly/react-core";
import {
  Caption,
  type ISortBy,
  type OnSort,
  type SortByDirection,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Drawer, Tag } from "antd";
import { differenceInSeconds, format } from "date-fns";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTypedSelector } from "../../../store/hooks";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { formatBytes } from "../../Feeds/utilties";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext } from "../context";
import useLongPress, {
  getBackgroundRowColor,
  useAssociatedFeed,
} from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";
import { getFileName, getLinkFileName } from "./FileCard";
import { getFolderName } from "./FolderCard";

interface TableProps {
  data: {
    folders: FileBrowserFolder[];
    files: FileBrowserFolderFile[];
    linkFiles: FileBrowserFolderLinkFile[];
  };
  computedPath: string;
  handleFolderClick: (folderName: string) => void;
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
}

const columnNames = {
  name: "Name",
  date: "Created",
  owner: "Creator",
  size: "Size",
};

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
}

const BaseRow: React.FC<RowProps> = ({
  rowIndex,
  resource,
  name,
  date,
  owner,
  size,
  type,
  computedPath,
  handleFolderClick,
  handleFileClick,
}) => {
  const { handlers } = useLongPress();
  const { handleOnClick, handleCheckboxChange } = handlers;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const rowRef = useRef<HTMLTableRowElement>(null); // Create a ref for the row

  const secondsSinceCreation = differenceInSeconds(new Date(), new Date(date));
  const [isNewResource, setIsNewResource] = useState<boolean>(
    secondsSinceCreation <= 15,
  );

  useEffect(() => {
    if (isNewResource && rowRef.current) {
      rowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const timeoutId = setTimeout(() => {
        setIsNewResource(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [isNewResource]);

  const isSelected =
    selectedPaths.length > 0 &&
    selectedPaths.some((payload) => {
      if (type === "folder" || type === "link") {
        return payload.path === resource.data.path;
      }
      if (type === "file") {
        return payload.path === resource.data.fname;
      }
    });

  const shouldHighlight = isNewResource || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
  const icon = getIcon(type, isDarkTheme, {
    marginRight: "0.5em",
  });

  const handleItem = () => {
    if (type === "folder") {
      handleFolderClick();
    } else if (type === "link") {
      handleFileClick();
    } else if (type === "file") {
      handleFileClick();
    }
  };

  const path =
    type === "folder" || type === "link"
      ? resource.data.path
      : resource.data.fname;

  return (
    <FolderContextMenu
      origin={{
        type: OperationContext.LIBRARY,
        additionalKeys: [computedPath],
      }}
      key={path}
    >
      <Tr
        ref={rowRef} // Attach the ref to the row
        style={{ background: highlightedBgRow, cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          handleOnClick(e, resource, path, type, () => {
            handleItem();
          });
        }}
        onContextMenu={(e) => {
          handleOnClick(e, resource, path, type);
        }}
        isSelectable={true}
        isRowSelected={isSelected}
      >
        <Td
          onClick={(e) => e.stopPropagation()}
          select={{
            rowIndex: rowIndex,
            onSelect: (event) =>
              handleCheckboxChange(event, path, resource, type),
            isSelected: isSelected,
          }}
        />
        <Td dataLabel={columnNames.name}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleItem();
            }}
            style={{ padding: "0.25em" }}
            icon={icon}
            variant="link"
          >
            {name}
          </Button>
          <span
            style={{
              display: "inline-block",
              width: "90px",
              marginLeft: "0.25em",
            }}
          >
            {isNewResource ? <Tag color="#3E8635">Newly Added</Tag> : null}
          </span>
        </Td>
        <Td dataLabel={columnNames.date}>
          {format(new Date(date), "dd MMM yyyy, HH:mm")}
        </Td>
        <Td dataLabel={columnNames.owner}>{owner}</Td>
        <Td dataLabel={columnNames.size}>
          {size > 0 ? formatBytes(size, 0) : " "}
        </Td>
      </Tr>
    </FolderContextMenu>
  );
};

export const FolderRow: React.FC<Omit<RowProps, "type">> = (props) => {
  const { data, isLoading } = useAssociatedFeed(props.name);

  if (isLoading) {
    return (
      <Tr>
        <Skeleton width="100%" />
      </Tr>
    );
  }

  return (
    <BaseRow
      {...props}
      name={data ? data : props.name} // Example of adding feed info to the row name
      type="folder"
    />
  );
};

export const FileRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <BaseRow {...props} type="file" />
);

export const LinkRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <BaseRow {...props} type="link" />
);

const LibraryTable: React.FC<TableProps> = ({
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
  const [sortBy, setSortBy] = useState<ISortBy>({
    index: 0,
    direction: "asc",
  });

  const handleFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const onSort: OnSort = (_event, columnIndex, sortByDirection) => {
    setSortBy({ index: columnIndex, direction: sortByDirection });
    return sortRows(columnIndex, sortByDirection);
  };

  const sortRows = (index: number, direction: SortByDirection) => {
    const sortedData = { ...data };
    if (index === 1) {
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
    } else if (index === 2) {
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
    }
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
          <FileDetailView
            selectedFile={selectedFile}
            preview="large"
            list={data.files}
            fetchMore={fetchMore}
            handlePagination={handlePagination}
            filesLoading={filesLoading}
          />
        )}
      </Drawer>
      <Table
        className="library-table"
        variant="compact"
        aria-label="Simple table"
        isStriped={true}
      >
        <Caption>Data Library</Caption>
        <Thead>
          <Tr>
            <Th screenReaderText="Select a row" arial-label="Select a row" />
            <Th sort={{ sortBy, onSort, columnIndex: 1 }} name="name">
              {columnNames.name}
            </Th>
            <Th sort={{ sortBy, onSort, columnIndex: 2 }} name="date">
              {columnNames.date}
            </Th>
            <Th name="owner">{columnNames.owner}</Th>
            <Th name="size">{columnNames.size}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.folders.map((resource: FileBrowserFolder, index) => (
            <FolderRow
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
            />
          ))}
          {data.files.map((resource: FileBrowserFolderFile, index) => (
            <FileRow
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
            />
          ))}
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile, index) => (
            <LinkRow
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
            />
          ))}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};

export default LibraryTable;
