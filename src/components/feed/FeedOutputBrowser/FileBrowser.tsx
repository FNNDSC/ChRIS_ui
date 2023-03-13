import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerPanelBody,
  DrawerHead,
  DrawerActions,
  ApplicationLauncher,
  ApplicationLauncherItem,
  DropdownPosition,
  Tooltip,
} from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { FiSidebar } from "react-icons/fi";
import { FaFileCode, FaFilm } from "react-icons/fa";
import {
  MdFileDownload,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";
import {
  AiFillFileImage,
  AiFillFileText,
  AiFillFile,
  AiFillFolder,
  AiOutlineExpandAlt,
  AiOutlineMenuFold,
} from "react-icons/ai";
import FileDetailView from "../Preview/FileDetailView";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { bytesToSize } from "./utils";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import { FeedFile } from "@fnndsc/chrisapi";
import { FileBrowserProps } from "./types";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../../store/explorer/actions";
import { BiHorizontalCenter } from "react-icons/bi";
import { getXtkFileMode } from "../../detailedView/displays/XtkViewer/XtkViewer";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { EmptyStateLoader } from "./FeedOutputBrowser";
import { useTypedSelector } from "../../../store/hooks";
import { ClipboardCopyContainer } from "../../common/textcopypopover/TextCopyPopover";
import {
  ButtonWithTooltip,
  DrawerCloseButtonWithTooltip,
} from "../../common/button";
import { LoadingErrorAlert } from "../../common/errorHandling";

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
    expandSidebar,
    handleSidebarDrawer,
  } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const dispatch = useDispatch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [appLauncher, setAppLauncher] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);

  const { files, folders, path } = pluginFilesPayload;
  const cols = [{ title: "Name" }, { title: "Size" }, { title: "" }];
  const items = files && folders ? [...files, ...folders] : [];
  const { id, plugin_name } = selected.data;
  const pathSplit = path && path.split(`/${plugin_name}_${id}/`);
  const breadcrumb = path ? pathSplit[1].split("/") : [];
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
  const previewAnimation = [{ opacity: "0.0" }, { opacity: "1.0" }];

  const previewAnimationTiming = {
    duration: 1000,
    iterations: 1,
  };
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

  const toggleAnimation = () => {
    document
      .querySelector(".preview-panel")
      ?.animate(previewAnimation, previewAnimationTiming);
    document
      .querySelector(".small-preview")
      ?.animate(previewAnimation, previewAnimationTiming);
  };

  const handlePrevClick = () => {
    if (currentRowIndex >= 1) {
      const prevItem = items[currentRowIndex - 1];
      setCurrentRowIndex(currentRowIndex - 1);
      if (typeof prevItem !== "string") {
        dispatch(setSelectedFile(prevItem));
      }
      toggleAnimation();
    }
  };
  const handleNextClick = () => {
    if (currentRowIndex < items.length - 1) {
      const nextItem = items[currentRowIndex + 1];
      setCurrentRowIndex(currentRowIndex + 1);
      if (typeof nextItem !== "string") {
        dispatch(setSelectedFile(nextItem));
      }
      toggleAnimation();
    }
  };

  const handleToggleAppLauncher = () => {
    setAppLauncher(!appLauncher);
  };

  const imageFileTypes = ["dcm", "png", "jpg", "nii", "jpeg"];
  const fileType = selectedFile && getFileExtension(selectedFile.data.fname);

  const appLauncherItems: React.ReactElement[] = [
    <ApplicationLauncherItem
      component={
        <ButtonWithTooltip
          position="bottom"
          content={<span>Open in Full Screen</span>}
          variant="link"
          onClick={handleFileBrowserToggle}
          icon={<AiOutlineExpandAlt />}
        />
      }
      key="application_1a"
    />,
    <ApplicationLauncherItem
      component={
        <ButtonWithTooltip
          content={<span>Open the Dicom Viewer</span>}
          variant="link"
          onClick={handleDicomViewerOpen}
          icon={<FaFilm />}
        />
      }
      key="application_2a"
    />,
    <ApplicationLauncherItem
      component={
        <ButtonWithTooltip
          content={<span>Open the XTK Viewer</span>}
          position="bottom"
          variant="link"
          onClick={handleXtkViewerOpen}
          icon={<BiHorizontalCenter />}
        />
      }
      key="test"
    />,
    <ApplicationLauncherItem
      component={
        <ButtonWithTooltip
          position="left"
          content={<span>Previous</span>}
          variant="link"
          icon={<MdNavigateBefore />}
          className="carousel__first"
          onClick={handlePrevClick}
        />
      }
      key="test1"
    />,

    <ApplicationLauncherItem
      component={
        <ButtonWithTooltip
          position="left"
          content={<span>Next</span>}
          variant="link"
          className="carousel__second"
          icon={<MdNavigateNext />}
          onClick={handleNextClick}
        />
      }
      key="test2"
    />,
  ];

  const previewPanel = (
    <DrawerPanelContent
      className="file-browser__previewPanel"
      isResizable
      defaultSize="52.9%"
      minSize={"25%"}
    >
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButtonWithTooltip
            content={<span>Close File Preview Panel</span>}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody className="file-browser__drawerbody">
        <>
          <ApplicationLauncher
            toggleIcon={
              <Tooltip
                position="left"
                content={<span>Open toolbar for maximizing</span>}
              >
                <AiOutlineMenuFold
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                />
              </Tooltip>
            }
            style={{
              position: "absolute",
              top: "1.5rem",
              zIndex: "99999",
              marginLeft: "calc(100% - 55px)",
            }}
            onToggle={handleToggleAppLauncher}
            isOpen={appLauncher}
            items={appLauncherItems}
            position={DropdownPosition.left}
          />
          {selectedFile && (
            <FileDetailView selectedFile={selectedFile} preview="large" />
          )}
        </>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Grid hasGutter className="file-browser">
      <Drawer isInline isExpanded={isExpanded}>
        <DrawerContent
          panelContent={previewPanel}
          className="file-browser__firstGrid"
        >
          <DrawerContentBody>
            <div className="file-browser__header">
              <div className="file-browser__header--breadcrumbContainer">
                {!expandSidebar && (
                  <ButtonWithTooltip
                    position="bottom"
                    content={<span>Open The Tree View</span>}
                    variant="secondary"
                    onClick={() => {
                      handleSidebarDrawer();
                    }}
                    icon={<FiSidebar />}
                  />
                )}

                <ClipboardCopyContainer path={path} />
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
              <TableHeader className="file-browser-table--head" />
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
                    setCurrentRowIndex(rowIndex);
                    if (typeof item === "string") {
                      handleFileClick(`${path}/${item}`);
                    } else {
                      toggleAnimation();
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
  handleToggleViewer: () => void;
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
    <>
      <div className="header-panel__buttons--toggleViewer">
        {explore && (
          <ButtonWithTooltip
            position="bottom"
            content={<span>Open in Full Screen</span>}
            variant="link"
            onClick={handleFileBrowserOpen}
            icon={<AiOutlineExpandAlt />}
          />
        )}

        {!fileType && (
          <LoadingErrorAlert
            error={{
              message:
                "Please select a file to see the list of available viewers",
            }}
          />
        )}
        {fileType && imageFileTypes.includes(fileType) && (
          <ButtonWithTooltip
            content={<span>Open the Dicom Viewer</span>}
            variant="link"
            onClick={handleDicomViewerOpen}
            icon={<FaFilm />}
          />
        )}
        {fileType && getXtkFileMode(fileType) && (
          <ButtonWithTooltip
            content={<span>Open the XTK Viewer</span>}
            position="bottom"
            variant="link"
            onClick={handleXtkViewerOpen}
            icon={<BiHorizontalCenter />}
          />
        )}
      </div>
    </>
  );
};
