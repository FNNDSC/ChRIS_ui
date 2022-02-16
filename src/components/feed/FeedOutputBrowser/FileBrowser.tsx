import React, { useState } from "react";
import classNames from "classnames";
import Moment from "react-moment";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Button,
  DropdownItem,
  Dropdown,
  DropdownToggle,
} from "@patternfly/react-core";

import { MdFileDownload } from "react-icons/md";
import {
  AiFillFileImage,
  AiFillFileText,
  AiFillFile,
  AiFillFolder,
  AiOutlineExpandAlt,
  AiFillCloseCircle,
} from "react-icons/ai";
import { FaFileCode, FaFilm } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableBody,
  cellWidth,
  truncate,
} from "@patternfly/react-table";
import FileDetailView from "../Preview/FileDetailView";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import { FileBrowserProps, FileBrowserState } from "./types";
import { DataNode } from "../../../store/explorer/types";
import {
  setSelectedFile,
  setSelectedFolder,
} from "../../../store/explorer/actions";
import { BiHorizontalCenter } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { getXtkFileMode } from "../../detailedView/displays/XtkViewer/XtkViewer";

function getInitialState(root: DataNode) {
  return {
    directory: root,
    currentFile: [root],
    breadcrumbs: [root],
  };
}

const FileBrowser = (props: FileBrowserProps) => {
  const {
    root,
    selectedFiles,
    downloadAllClick,
    handleFileBrowserToggle,
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    expandDrawer,
  } = props;
  const [fileBrowserState, setfileBrowserState] =
    React.useState<FileBrowserState>(getInitialState(root));
  const { directory, breadcrumbs, currentFile } = fileBrowserState;
  const { selectedFile } = useTypedSelector((state) => state.explorer);
  const dispatch = useDispatch();

  const handleFileClick = (e: React.MouseEvent, rows: any[], rowData: any) => {
    const target = e.nativeEvent.target as HTMLElement;
    if (e.button !== 0 || target.closest(".download-file")) {
      return;
    }

    const rowIndex = rowData.rowIndex;
    const file = directory.children[rowIndex];

    if (file.children && file.children.length > 0) {
      setfileBrowserState({
        ...fileBrowserState,
        directory: file,
        currentFile: [...currentFile, file],
        breadcrumbs: [...breadcrumbs, file],
      });
    } else {
      dispatch(setSelectedFile(file));
      dispatch(setSelectedFolder(directory.children));
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent, node: DataNode) => {
    e.stopPropagation();
    if (node.file) {
      const blob = await node.file.getFileBlob();
      FileViewerModel.downloadFile(blob, node.file.data.fname);
    }
  };

  const handleBreadcrumbClick = (
    e: React.MouseEvent,
    value: DataNode,
    prevBreadcrumbs: DataNode[]
  ) => {
    e.preventDefault();

    if (directory) {
      setfileBrowserState({
        ...fileBrowserState,
        directory: value,
        breadcrumbs: [...prevBreadcrumbs, value],
      });
    }
  };

  const generateBreadcrumb = (
    value: DataNode,
    index: number,
    array: DataNode[]
  ) => {
    const prevBreadcrumbs = array.slice(0, index);
    const onClick = (e: React.MouseEvent) =>
      handleBreadcrumbClick(e, value, prevBreadcrumbs);

    return (
      <BreadcrumbItem
        className="file-browser__header--crumb"
        showDivider={true}
        onClick={
          index !== array.length - 1
            ? onClick
            : () => {
                return;
              }
        }
        key={index}
      >
        {`${value.title}`}
      </BreadcrumbItem>
    );
  };

  const generateTableRow = (node: DataNode) => {
    let type = "UNKNOWN FORMAT";
    let fileSize = "";
    if (node.children && node.children.length > 0) {
      type = "dir";
    } else {
      fileSize = node.fileSize;
      const name = node.title;
      if (name.indexOf(".") > -1) {
        type = name.split(".").splice(-1)[0].toUpperCase();
      }
    }
    const icon = getIcon(type);
    const isPreviewing = selectedFile && selectedFile.key === node.key;
    const iconRow = {
      title: icon,
    };
    const fileName = (
      <div
        className={classNames(
          "file-browser__table--fileName",
          isPreviewing && "file-browser__table--isPreviewing"
        )}
      >
        {node.title}
      </div>
    );

    const creationDate = (
      <Moment format="DD MMM YYYY , HH:mm">
        {
          //@ts-ignore
          node.file?.data.creation_date
        }
      </Moment>
    );
    const name = {
      title: fileName,
    };

    const size = {
      title: fileSize,
    };

    const download = {
      title: (
        <MdFileDownload
          className="download-file-icon"
          onClick={(e: any) => handleDownloadClick(e, node)}
        />
      ),
    };

    const creation_date = {
      title: creationDate,
    };

    return {
      cells: [iconRow, name, creation_date, size, download],
    };
  };

  const cols = [
    { title: "" },
    { title: "Name", transforms: [cellWidth(40)], cellTransforms: [truncate] },
    { title: "Creation Date" },
    { title: "Size" },
    { title: "" },
  ];

  if (!directory || directory.children.length === 0) {
    return <div>No Files in this directory.</div>;
  }

  const rows = directory.children.map(generateTableRow);

  const fileType =
    selectedFile &&
    selectedFile.file &&
    getFileExtension(selectedFile.file.data.fname);

  const previewPanel = (
    <>
      <HeaderPanel
        handleFileBrowserOpen={handleFileBrowserToggle}
        handleDicomViewerOpen={handleDicomViewerOpen}
        handleXtkViewerOpen={handleXtkViewerOpen}
        expandDrawer={expandDrawer}
        fileType={fileType}
      />

      {selectedFile && selectedFile.file && (
        <FileDetailView selectedFile={selectedFile.file} preview="small" />
      )}
    </>
  );

  return (
    <Grid hasGutter className="file-browser">
      <GridItem
        xl2={5}
        xl2RowSpan={12}
        xl={6}
        xlRowSpan={12}
        lg={4}
        lgRowSpan={12}
        md={4}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
        className="file-browser__firstGrid"
      >
        <div className="file-browser__header">
          <div className="file-browser__header--breadcrumbContainer">
            <Breadcrumb>{breadcrumbs.map(generateBreadcrumb)}</Breadcrumb>
          </div>

          <div className="file-browser__header__info">
            <span className="files-browser__header--fileCount">
              {selectedFiles
                ? `(${selectedFiles.length} files)`
                : "Empty Directory"}
            </span>
            <Button
              className="file-browser__header--downloadButton"
              onClick={() => downloadAllClick()}
              variant="secondary"
            >
              Download All
            </Button>
          </div>
        </div>

        <Table
          className="file-browser__table"
          aria-label="file-browser-table"
          variant="compact"
          cells={cols}
          rows={rows}
        >
          <TableHeader />
          <TableBody onRowClick={handleFileClick} />
        </Table>
      </GridItem>

      <GridItem
        xl2={7}
        xl2RowSpan={12}
        xl={6}
        xlRowSpan={12}
        lg={8}
        lgRowSpan={12}
        md={8}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
        className="file-browser__grid2"
      >
        {previewPanel}
      </GridItem>
    </Grid>
  );
};

export default FileBrowser;

/**
 *
 * @param type string
 * @returns JSX Element
 */

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
  expandDrawer: (panel: string) => void;
  fileType?: string;
}

const HeaderPanel = (props: HeaderPanelProps) => {
  const {
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handleFileBrowserOpen,
    expandDrawer,
    fileType,
  } = props;

  const [showOpenWith, setShowOpenWith] = useState(false);

  const imageFileTypes = ["dcm", "png", "jpg", "nii", "gz", "jpeg"];

  return (
    <div className="header-panel__buttons">
      <div className="header-panel__buttons--toggleViewer">
        <Button
          variant="link"
          onClick={handleFileBrowserOpen}
          icon={<AiOutlineExpandAlt />}
        >
          Maximize
        </Button>
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
        <Dropdown
          toggle={
            <DropdownToggle
              className="open-with-dropdown"
              onToggle={(open: any) => setShowOpenWith(open)}
              toggleIndicator={FaCaretDown}
            >
              Open With
            </DropdownToggle>
          }
          onSelect={() => setShowOpenWith(!showOpenWith)}
          isOpen={showOpenWith}
          dropdownItems={[
            <DropdownItem onClick={handleDicomViewerOpen} key="image-viewer">
              Open with Image Viewer
            </DropdownItem>,
            <DropdownItem onClick={handleXtkViewerOpen} key="xtk-viewer">
              Open with XTK Viewer
            </DropdownItem>,
          ]}
        />
      </div>
      <div className="header-panel__buttons--togglePanel">
        <Button
          onClick={() => expandDrawer("bottom_panel")}
          variant="tertiary"
          type="button"
          icon={<AiFillCloseCircle />}
        />
      </div>
    </div>
  );
};
