import React from "react";
import classNames from "classnames";
import FileDetailView from "../Preview/FileDetailView";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Button,
  Drawer,
  DrawerPanelContent,
  DrawerContentBody,
  DrawerContent,
} from "@patternfly/react-core";
import {
  DownloadIcon,
  FileImageIcon,
  FileCodeIcon,
  FileAltIcon,
  FileIcon,
  FolderCloseIcon,
  ExpandIcon,
  FilmIcon,
  CloseIcon,
} from "@patternfly/react-icons";
import {
  Table,
  TableHeader,
  TableBody,
  cellWidth,
  truncate,
  TableText,
} from "@patternfly/react-table";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { FileBrowserProps, FileBrowserState } from "./types";
import { DataNode } from "../../../store/explorer/types";
import { setSelectedFile } from "../../../store/explorer/actions";

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
    handleFileViewerToggle,
    expandDrawer,
    breadcrumb,
  } = props;
  const [
    fileBrowserState,
    setfileBrowserState,
  ] = React.useState<FileBrowserState>(getInitialState(root));
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
        {value.title}
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
        <TableText wrapModifier="truncate"> {node.title}</TableText>
      </div>
    );
    const name = {
      title: fileName,
    };

    const size = {
      title: fileSize,
    };

    const download = {
      title: (
        <DownloadIcon
          className="download-file-icon"
          onClick={(e) => handleDownloadClick(e, node)}
        />
      ),
    };

    return {
      cells: [iconRow, name, type, size, download],
    };
  };

  const cols = [
    { title: "" },
    { title: "Name", transforms: [cellWidth(40)], cellTransforms: [truncate] },
    { title: "Type" },
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
      {renderHeaderPanel(
        handleFileViewerToggle,
        handleFileBrowserToggle,
        expandDrawer,
        fileType
      )}

      {selectedFile && selectedFile.file && (
        <FileDetailView selectedFile={selectedFile.file} preview="small" />
      )}
    </>
  );

  return (
    <Grid hasGutter className="file-browser">
      <Drawer isExpanded={true} isInline>
        <DrawerContent
          panelContent={
            <DrawerPanelContent defaultSize="60.5%" minSize="30%" isResizable>
              {previewPanel}
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody>
            <GridItem
              xl2={4}
              xl2RowSpan={12}
              xl={4}
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
                <Breadcrumb>
                    {breadcrumb.map((value: string, index: number) => {
                      return (
                        <BreadcrumbItem key={index}>{value}</BreadcrumbItem>
                      );
                    })}
                  </Breadcrumb>
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
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
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
      return <FolderCloseIcon />;
    case "dcm":
    case "jpg":
    case "png":
      return <FileImageIcon />;
    case "html":
    case "json":
      return <FileCodeIcon />;
    case "txt":
      return <FileAltIcon />;
    default:
      return <FileIcon />;
  }
};

const renderHeaderPanel = (
  toggleFileViewer: () => void,
  toggleFileBrowser: () => void,
  expandDrawer: (panel: string) => void,
  fileType?: string
) => {
  return (
    <div className="header-panel__buttons">
      <div className="header-panel__buttons--toggleViewer">
        <Button
          variant="link"
          onClick={toggleFileBrowser}
          icon={<ExpandIcon />}
        >
          Maximize
        </Button>
        {(fileType === "dcm" ||
          fileType === "png" ||
          fileType === "jpg" ||
          fileType === "nii" ||
          fileType === "jpeg") && (
          <Button variant="link" onClick={toggleFileViewer} icon={<FilmIcon />}>
            Open Image Viewer
          </Button>
        )}
      </div>
      <div className="header-panel__buttons--togglePanel">
        <Button
          onClick={() => expandDrawer("bottom_panel")}
          variant="tertiary"
          type="button"
          icon={<CloseIcon />}
        />
      </div>
    </div>
  );
};
