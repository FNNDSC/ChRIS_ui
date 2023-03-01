import React, {useState } from "react";

import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Button,
  HelperTextItem,
  HelperText,
  ClipboardCopyButton, clipboardCopyFunc, DrawerHead, Drawer, DrawerContent, DrawerContentBody, DrawerPanelContent, DrawerActions, DrawerCloseButton, DrawerPanelBody
} from "@patternfly/react-core";
import { bytesToSize } from "./utils";
import { FeedFile } from "@fnndsc/chrisapi";
import { MdFileDownload } from "react-icons/md";
import {
  AiFillFileImage,
  AiFillFileText,
  AiFillFile,
  AiFillFolder,
  AiOutlineExpandAlt,
} from "react-icons/ai";
import { FaFileCode, FaFilm } from "react-icons/fa";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import FileDetailView from "../Preview/FileDetailView";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import { FileBrowserProps } from "./types";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../../store/explorer/actions";
import { BiHorizontalCenter } from "react-icons/bi";
import { getXtkFileMode } from "../../detailedView/displays/XtkViewer/XtkViewer";
import { Alert } from "antd";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { EmptyStateLoader } from "./FeedOutputBrowser";

const getFileName = (name: any) => {
  return name.split("/").slice(-1);
};

const FileBrowser = (props: FileBrowserProps) => {
  const {
    pluginFilesPayload,
    handleFileClick,
    selected,
    handleFileBrowserToggle,
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    explore,
    filesLoading,
  } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const dispatch = useDispatch();

  const [isExpanded, setIsExpanded] = useState(false);

  const { files, folders, path } = pluginFilesPayload;
  const cols = [{ title: "Name" }, { title: "Size" }, { title: "" }];

  const items = files && folders ? [...files, ...folders] : [];

  const handleDownloadClick = async (e: React.MouseEvent, item: FeedFile) => {
    e.stopPropagation();
    if (item) {
      const blob = await item.getFileBlob();
      FileViewerModel.downloadFile(blob, item.data.fname);
    }
  };

  const generateTableRow = (item: string | FeedFile) => {
    let type, icon, fsize, fileName;
    type = "UNKNOWN FORMAT";
    const isPreviewing = selectedFile === item;

    if (typeof item === "string") {
      type = "dir";
      icon = getIcon(type);
      fileName = item;
    } else {
      fileName = getFileName(item.data.fname);
      if (fileName.indexOf(".") > -1) {
        type = getFileName(fileName)[0].toUpperCase();
      }
      fsize = bytesToSize(item.data.fsize);
      icon = getIcon(type);
    }

    const fileNameComponent = (
      <div
        className={`file-browser__table--fileName 
          ${isPreviewing && "file-browser__table--isPreviewing"}`}
      >
        <span>{icon}</span>
        <span>{fileName}</span>
      </div>
    );

    const name = {
      title: fileNameComponent,
    };

    const size = {
      title: fsize,
    };

    const downloadComponent =
      typeof item === "string" ? undefined : (
        <MdFileDownload
          className="download-file-icon"
          onClick={(e: any) => handleDownloadClick(e, item)}
        />
      );

    const download = {
      title: downloadComponent,
    };

    return {
      cells: [name, size, download],
    };
  };
  const rows = items.length > 0 ? items.map(generateTableRow) : [];

  const { id, plugin_name } = selected.data;
  const pathSplit = path && path.split(`/${plugin_name}_${id}/`);
  const breadcrumb = path ? pathSplit[1].split("/") : [];

  const generateBreadcrumb = (value: string, index: number) => {
    const onClick = () => {
      dispatch(clearSelectedFile());
      if (index === breadcrumb.length - 1) {
        return;
      } else {
        const findIndex = breadcrumb.findIndex((path) => path === value);
        if (findIndex !== -1) {
          const newPathList = breadcrumb.slice(0, findIndex + 1);
          const combinedPathList = [
            ...pathSplit[0].split("/"),
            `${plugin_name}_${id}`,
            ...newPathList,
          ];
          handleFileClick(combinedPathList.join("/"));
        }
      }
    };

    return (
      <BreadcrumbItem
        className="file-browser__header--crumb"
        showDivider={true}
        key={index}
        onClick={onClick}
        to={index === breadcrumb.length - 1 ? undefined : "#"}
      >
        {value}
      </BreadcrumbItem>
    );
  };

  const previewPanel = (
    <DrawerPanelContent defaultSize="70%" minSize={"25%"}  >
      <DrawerHead>
        <span tabIndex={isExpanded ? 0 : -1} >
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsExpanded(false)} />
        </DrawerActions>
      </DrawerHead>

      <DrawerPanelBody>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {selectedFile ? (
          <div>
            <HelperText>
              <HelperTextItem>
                {getFileName(selectedFile.data.fname)}
              </HelperTextItem>
            </HelperText>
            <div className="header-panel__buttons">
              {selectedFile && (
                <HeaderPanel
                  explore={explore}
                  handleFileBrowserOpen={handleFileBrowserToggle}
                  handleDicomViewerOpen={handleDicomViewerOpen}
                  handleXtkViewerOpen={handleXtkViewerOpen}
                  selectedFile={selectedFile}
                />
              )}
            </div>
          </div>
        ) : (
          <span>Click on a file to preview:</span>
        )}
      </div>

      {selectedFile && (
        <FileDetailView selectedFile={selectedFile} preview="large" />
      )}

      </DrawerPanelBody>

    </DrawerPanelContent>
  );

  const [copied, setCopied] = React.useState(false);
  return (
    <Grid hasGutter className="file-browser">
      <Drawer isExpanded={isExpanded} >
      <DrawerContent panelContent={previewPanel} className="file-browser__firstGrid"
>
          <DrawerContentBody >
          <div className="file-browser__header">
          <div className="file-browser__header--breadcrumbContainer">
            <ClipboardCopyButton
              onClick={(event: any) => {
                setCopied(true);
                clipboardCopyFunc(event, path);
              }}
              onTooltipHidden={() => setCopied(false)}
              id="clipboard-plugininstance-files"
              textId="clipboard-plugininstance-files"
              variant="plain">
              { copied ? "Copied!" : "Copy path to clipboard" }
            </ClipboardCopyButton>
            <Breadcrumb>{breadcrumb.map(generateBreadcrumb)}</Breadcrumb>
          </div>

          <div className="file-browser__header__info">
            <span className="files-browser__header--fileCount">
              {items.length > 1
                ? `(${items.length} items)`
                : items.length === 1
                ? `(${items.length} item)`
                : "Empty Directory"}
            </span>
          </div>
        </div>
        <Table
          aria-label="file-browser-table"
          variant="compact"
          cells={cols}
          rows={rows}
        >
          <TableHeader />
          {filesLoading ? (
            <SpinContainer title="Fetching Files" />
          ) : !filesLoading && items.length === 0 ? (
            <EmptyStateLoader title="Empty Data set" />
          ) : (
            <TableBody
              onRowClick={(event: any, rows: any, rowData: any) => {
                dispatch(clearSelectedFile());
                const rowIndex = rowData.rowIndex;
                const item = items[rowIndex];
                if (typeof item === "string") {
                  handleFileClick(`${path}/${item}`);
                } else {
                  dispatch(setSelectedFile(item));
                  setIsExpanded(true);
                }
              }}
            />
          )}
        </Table>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </Grid>
  );
};

export default FileBrowser;

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "dir":
      return <AiFillFolder />;
    case "dcm":
    case "jpg":
    case "png":
      return <AiFillFileImage />;
    case "html":
    case "json":
      return <FaFileCode />;
    case "txt":
      return <AiFillFileText />;
    default:
      return <AiFillFile />;
  }
};

interface HeaderPanelProps {
  handleDicomViewerOpen: () => void;
  handleXtkViewerOpen: () => void;
  handleFileBrowserOpen: () => void;
  selectedFile: FeedFile;
  explore: boolean;
}

const HeaderPanel = (props: HeaderPanelProps) => {
  const {
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handleFileBrowserOpen,
    explore,
    selectedFile,
  } = props;

  const imageFileTypes = ["dcm", "png", "jpg", "nii", "jpeg"];
  const fileType = getFileExtension(selectedFile.data.fname);

  return (
    <div className="header-panel__buttons--toggleViewer">
      {explore && (
        <Button
          variant="link"
          onClick={handleFileBrowserOpen}
          icon={<AiOutlineExpandAlt />}
        >
          Explore
        </Button>
      )}

      {!fileType && (
        <Alert
          type="info"
          message="Please select a file to see the list of available viewers"
        />
      )}
      {fileType && imageFileTypes.includes(fileType) && (
        <Button
          variant="link"
          onClick={handleDicomViewerOpen}
          icon={<FaFilm />}
        >
          Open Image Viewer
        </Button>
      )}
      {fileType && getXtkFileMode(fileType) && (
        <Button
          variant="link"
          onClick={handleXtkViewerOpen}
          icon={<BiHorizontalCenter />}
        >
          Open XTK Viewer
        </Button>
      )}
    </div>
  );
};
