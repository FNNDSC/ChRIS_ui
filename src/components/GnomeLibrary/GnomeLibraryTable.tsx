import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Skeleton } from "@patternfly/react-core";
import { format } from "date-fns";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { ThemeContext } from "../DarkTheme/useTheme";
import { formatBytes } from "../Feeds/utilties";
import FileDetailView from "../Preview/FileDetailView";
import { Drawer, Tag } from "antd";
import { OperationContext } from "../NewLibrary/context";
import useLongPress, {
  getBackgroundRowColor,
  useAssociatedFeed,
} from "../NewLibrary/utils/longpress";
import useNewResourceHighlight from "../NewLibrary/utils/useNewResourceHighlight";
import { FolderContextMenu } from "../NewLibrary/components/ContextMenu";
import {
  getFileName,
  getLinkFileName,
} from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import { useAppSelector } from "../../store/hooks";
import styles from "./gnome.module.css";
import { FolderIcon, FileIcon } from "@patternfly/react-icons";

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
  const { isDarkTheme } = useContext(ThemeContext);
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

  const shouldHighlight = isNewResource || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);
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
      <li ref={scrollToNewResource} style={{ background: highlightedBgRow }}>
        <Button
          variant="plain"
          className={styles.fileListItem}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick(e, resource, path, type, () => {
              handleItem();
            });
          }}
          onContextMenu={(e) => {
            handleOnClick(e, resource, path, type);
          }}
          aria-label={`${name} ${type}`}
          style={{
            width: "100%",
            height: "auto",
            display: "flex",
            textAlign: "left",
            padding: "12px 16px",
            color: "inherit",
            backgroundColor: "transparent",
          }}
        >
          <div className={styles.fileName}>
            {type === "folder" ? (
              <FolderIcon />
            ) : type === "link" ? (
              <FileIcon style={{ color: "#1fa7f8" }} />
            ) : (
              <FileIcon />
            )}
            <span className={styles.fileNameText}>{name}</span>
            {isNewResource && (
              <span style={{ marginLeft: "0.5em" }}>
                <Tag color="#3E8635">Newly Added</Tag>
              </span>
            )}
          </div>
          <div className={styles.fileDate}>
            {format(new Date(date), "dd MMM yyyy, HH:mm")}
          </div>
          {origin.type !== "fileBrowser" && (
            <div className={styles.fileOwner}>{owner}</div>
          )}
          <div className={styles.fileSize}>
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
}) => {
  const navigate = useNavigate();
  const [preview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileBrowserFolderFile>();

  const handleFileClick = (file: FileBrowserFolderFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const origin = {
    type: OperationContext.LIBRARY,
    additionalKeys: [computedPath],
  };

  console.log("Data", data);

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
        <div className={styles.fileListHeader}>
          <div className={styles.fileNameHeader}>Name</div>
          <div className={styles.fileDateHeader}>Created</div>
          {origin.type !== "fileBrowser" && (
            <div className={styles.fileOwnerHeader}>Creator</div>
          )}
          <div className={styles.fileSizeHeader}>Size</div>
        </div>

        <ul className={styles.fileList}>
          {data.folders.map((resource: FileBrowserFolder, index) => (
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
          {data.files.map((resource: FileBrowserFolderFile, index) => (
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
          {data.linkFiles.map((resource: FileBrowserFolderLinkFile, index) => (
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
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
};

export default GnomeLibraryTable;
