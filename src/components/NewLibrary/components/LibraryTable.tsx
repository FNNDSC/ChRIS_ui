import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTypedSelector } from "../../../store/hooks";
import { Button } from "@patternfly/react-core";
import {
  Caption,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Drawer } from "antd";
import { differenceInSeconds, format } from "date-fns";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { formatBytes } from "../../Feeds/utilties";
import FileDetailView from "../../Preview/FileDetailView";
import { OperationContext } from "../context";
import useLongPress, { getBackgroundRowColor } from "../utils/longpress";
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
}

const columnNames = {
  name: "Name",
  date: "Created",
  owner: "Creator",
  size: "Size",
};

interface RowProps {
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
  handleFolderClick: (folderName: string) => void;
  handleFileClick: (file: FileBrowserFolderFile) => void;
}

const BaseRow: React.FC<RowProps> = ({
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
  const navigate = useNavigate();
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const secondsSinceCreation = differenceInSeconds(new Date(), date);
  const [isNewResource, setIsNewResource] = useState<boolean>(
    secondsSinceCreation <= 15,
  );

  useEffect(() => {
    if (isNewResource) {
      const timeoutId = setTimeout(() => {
        setIsNewResource(false);
      }, 2000);

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
    marginRight: "0.25em",
  });

  const handleItem = () => {
    if (type === "folder") {
      handleFolderClick(name);
    } else if (type === "link") {
      navigate(resource.data.path);
    } else if (type === "file") {
      handleFileClick(resource as FileBrowserFolderFile);
    }
  };

  const path = type === "file" ? resource.data.fname : resource.data.path;

  return (
    <FolderContextMenu
      origin={{
        type: OperationContext.LIBRARY,
        additionalKeys: [computedPath],
      }}
      key={path}
    >
      <Tr
        style={{ background: highlightedBgRow }}
        onClick={(e) => {
          handleOnClick(e, resource, path, type);
        }}
        onContextMenu={(e) => {
          handleOnClick(e, resource, path, type);
        }}
      >
        <Td dataLabel={columnNames.name}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleItem();
            }}
            style={{ padding: 0 }}
            icon={icon}
            variant="link"
          >
            {name}
          </Button>
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

const FolderRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <BaseRow {...props} type="folder" />
);

const FileRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <BaseRow {...props} type="file" />
);

const LinkRow: React.FC<Omit<RowProps, "type">> = (props) => (
  <BaseRow {...props} type="link" />
);

const LibraryTable: React.FC<TableProps> = ({
  data,
  computedPath,
  handleFolderClick,
}) => {
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();

  const handleFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
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
      <Table
        className="library-table"
        variant="compact"
        aria-label="Simple table"
      >
        <Caption>Data Library</Caption>
        <Thead>
          <Tr>
            <Th>{columnNames.name}</Th>
            <Th>{columnNames.date}</Th>
            <Th>{columnNames.owner}</Th>
            <Th>{columnNames.size}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.folders.map((resource: FileBrowserFolder) => (
            <FolderRow
              key={resource.data.path}
              resource={resource}
              name={getFolderName(resource, computedPath)}
              date={resource.data.creation_date}
              owner=" "
              size={0}
              computedPath={computedPath}
              handleFolderClick={handleFolderClick}
              handleFileClick={handleFileClick}
            />
          ))}
          {data.files.map((resource: FileBrowserFolderFile) => (
            <FileRow
              key={resource.data.fname}
              resource={resource}
              name={getFileName(resource)}
              date={resource.data.creation_date}
              owner={resource.data.owner_username}
              size={resource.data.fsize}
              computedPath={computedPath}
              handleFolderClick={handleFolderClick}
              handleFileClick={handleFileClick}
            />
          ))}
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile) => (
            <LinkRow
              key={resource.data.path}
              resource={resource}
              name={getLinkFileName(resource)}
              date={resource.data.creation_date}
              owner={resource.data.owner_username}
              size={resource.data.fsize}
              computedPath={computedPath}
              handleFolderClick={handleFolderClick}
              handleFileClick={handleFileClick}
            />
          ))}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};

export default LibraryTable;
