import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
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
import { format } from "date-fns";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useTypedSelector } from "../../../store/hooks";
import { getIcon } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { formatBytes } from "../../Feeds/utilties";
import { OperationContext } from "../context";
import useLongPress, { getBackgroundRowColor } from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";
import { getFileName, getLinkFileName } from "./FileCard";
import { getFolderName } from "./FolderCard";
import "./LibraryTable.css";
import { Drawer } from "antd";
import FileDetailView from "../../Preview/FileDetailView";

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
  date: "Date",
  owner: "Owner",
  size: "Size",
};

const LibraryTable: React.FunctionComponent<TableProps> = (
  props: TableProps,
) => {
  const navigate = useNavigate();
  const { handlers } = useLongPress();
  const { handleOnClick } = handlers;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const { data, computedPath, handleFolderClick } = props;
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();

  const renderRow = (
    resource:
      | FileBrowserFolder
      | FileBrowserFolderFile
      | FileBrowserFolderLinkFile,
    name: string,
    date: string,
    owner: string,
    size: number,
    type: string,
  ) => {
    const isSelected =
      selectedPaths.length > 0 &&
      selectedPaths.some((payload) => payload.path === resource.data.path);
    const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);
    const icon = getIcon(type, isDarkTheme);

    const handleItem = (
      item:
        | FileBrowserFolderFile
        | FileBrowserFolder
        | FileBrowserFolderLinkFile,
      type: string,
    ) => {
      if (type === "folder") {
        handleFolderClick(name);
      }

      if (type === "link") {
        navigate(item.data.path);
      }

      if (type === "file") {
        // Show preview
        setSelectedFile(resource as FileBrowserFolderFile);
        setShowPreview(true);
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
          style={{ background: selectedBgRow }}
          onClick={(e) => {
            handleOnClick(e, resource, path, type);
          }}
          onContextMenu={(e) => {
            handleOnClick(e, resource, path, type);
          }}
          key={name}
        >
          <Td dataLabel={columnNames.name}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleItem(resource, type);
              }}
              style={{ padding: 0 }}
              icon={icon}
              variant="link"
            >
              {name}
            </Button>
          </Td>
          <Td dataLabel={columnNames.date}>
            {" "}
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
      <Table aria-label="Simple table">
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
          {data.folders.map((resource: FileBrowserFolder) => {
            const folderName = getFolderName(resource, computedPath);
            return renderRow(
              resource,
              folderName,
              resource.data.creation_date,
              " ",
              // Size of the folder is not available yet
              0,
              "folder",
            );
          })}
          {data.files.map((resource: FileBrowserFolderFile) => {
            const fileName = getFileName(resource);
            return renderRow(
              resource,
              fileName,
              resource.data.creation_date,
              resource.data.owner_username,
              resource.data.fsize,
              "file",
            );
          })}
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile) => {
            const fileName = getLinkFileName(resource);
            return renderRow(
              resource,
              fileName,
              resource.data.creation_date,
              resource.data.owner_username,
              resource.data.fsize,
              "link",
            );
          })}
        </Tbody>
      </Table>
    </React.Fragment>
  );
};

export default LibraryTable;
