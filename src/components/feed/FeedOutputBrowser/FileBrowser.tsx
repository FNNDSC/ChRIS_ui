import React from "react";
import classNames from "classnames";

import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Button,
  HelperTextItem,
  HelperText,
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
  AiFillCloseCircle,
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
    expandDrawer,
    filesLoading,
  } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const dispatch = useDispatch();

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
        className={classNames(
          "file-browser__table--fileName",
          isPreviewing && "file-browser__table--isPreviewing"
        )}
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
    <>
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
        <Button
          onClick={() => expandDrawer("bottom_panel")}
          variant="tertiary"
          type="button"
          icon={<AiFillCloseCircle />}
        />
      </div>

      {selectedFile && (
        <FileDetailView selectedFile={selectedFile} preview="small" />
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
                }
              }}
            />
          )}
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
