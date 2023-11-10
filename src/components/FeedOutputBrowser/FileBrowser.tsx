import React from "react";
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
} from "@patternfly/react-core";
import { Progress, notification } from "antd";
import { Table, Thead, Tbody, Th, Tr, Td } from "@patternfly/react-table";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import { handleClose, handleMaximize, handleMinimize } from "../Feeds/utilties";

import {
  FolderIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FaFileIcon from "@patternfly/react-icons/dist/esm/icons/file-icon";

import FileDetailView from "../Preview/FileDetailView";
import { FileViewerModel } from "../../api/model";
import { bytesToSize } from "./utilities";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../store/explorer/actions";
import { useTypedSelector } from "../../store/hooks";
import { setFilePreviewPanel } from "../../store/drawer/actions";
import { SpinContainer } from "../Common";
import { EmptyStateLoader } from "./FeedOutputBrowser";
import { ClipboardCopyContainer } from "../Common";
import XtkViewer from "../XtkViewer/XtkViewer";
import { DotsIndicator } from "../Common";
import type { FeedFile } from "@fnndsc/chrisapi";
import type { FileBrowserProps } from "./types";

const getFileName = (name: any) => {
  return name.split("/").slice(-1);
};

const FileBrowser = (props: FileBrowserProps) => {
  const { pluginFilesPayload, handleFileClick, selected, filesLoading } = props;
  const [status, setDownloadStatus] = React.useState<{
    [key: string]: number;
  }>({});

  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const drawerState = useTypedSelector((state) => state.drawers);
  const dispatch = useDispatch();
  const [currentRowIndex, setCurrentRowIndex] = React.useState(0);

  const { files, folders, path } = pluginFilesPayload;

  const columnNames = {
    name: "Name",
    size: "Size",
    download: "",
    statusRow: "",
  };
  const items = files && folders ? [...files, ...folders] : [];
  const { id, plugin_name } = selected.data;
  const pathSplit = path && path.split(`/${plugin_name}_${id}/`);
  const breadcrumb = path ? pathSplit[1].split("/") : [];

  const handleDownloadClick = async (e: React.MouseEvent, item: FeedFile) => {
    e.stopPropagation();
    if (item) {
      FileViewerModel.startDownload(item, notification, (status: any) => {
        setDownloadStatus(status);
      });
    }
  };

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

  const handleItem = (item: string | FeedFile) => {
    if (typeof item === "string") {
      handleFileClick(`${path}/${item}`);
    } else {
      toggleAnimation();
      dispatch(setSelectedFile(item));
      !drawerState["preview"].open && dispatch(setFilePreviewPanel());
    }
  };

  const handleNext = () => {
    if (currentRowIndex + 1 < items.length) {
      const item = items[currentRowIndex + 1];
      setCurrentRowIndex(currentRowIndex + 1);
      handleItem(item);
    }
  };
  const handlePrevious = () => {
    if (currentRowIndex - 1 >= 0) {
      const item = items[currentRowIndex - 1];
      setCurrentRowIndex(currentRowIndex - 1);
      handleItem(item);
    }
  };

  const previewPanel = (
    <DrawerPanelContent
      className="file-browser__previewPanel"
      isResizable
      defaultSize={
        !drawerState.directory.open && !drawerState.files.open
          ? "100%"
          : "55.3%"
      }
      minSize={"25%"}
    >
      <DrawerActionButton
        content="Preview"
        handleClose={() => {
          handleClose("preview", dispatch);
        }}
        handleMaximize={() => {
          handleMaximize("preview", dispatch);
        }}
        handleMinimize={() => {
          handleMinimize("preview", dispatch);
        }}
        maximized={drawerState["preview"].maximized}
      />
      <DrawerPanelBody className="file-browser__drawerbody">
        {drawerState["preview"].currentlyActive === "preview" &&
          selectedFile && (
            <FileDetailView
              gallery={true}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              selectedFile={selectedFile}
              preview="large"
            />
          )}
        {drawerState["preview"].currentlyActive === "xtk" && <XtkViewer />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Grid hasGutter className="file-browser">
      <Drawer position="right" isInline isExpanded={true}>
        <DrawerContent
          panelContent={drawerState.preview.open ? previewPanel : null}
          className="file-browser__firstGrid"
        >
          <DrawerActionButton
            content="Files"
            handleClose={() => {
              handleClose("files", dispatch);
            }}
            handleMaximize={() => {
              handleMaximize("files", dispatch);
            }}
            handleMinimize={() => {
              handleMinimize("files", dispatch);
            }}
            maximized={drawerState["files"].maximized}
          />
          {drawerState.files.open && (
            <DrawerContentBody>
              <div className="file-browser__header">
                <div className="file-browser__header--breadcrumbContainer">
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
              <Table aria-label="file-browser-table" variant="compact">
                <Thead className="file-browser-table--head">
                  <Tr>
                    <Th>{columnNames.name}</Th>
                    <Th>{columnNames.size}</Th>
                    <Th>{columnNames.download}</Th>
                    <Th>{columnNames.statusRow}</Th>
                  </Tr>
                </Thead>
                {filesLoading ? (
                  <SpinContainer title="Waiting on Node..." />
                ) : !filesLoading && items.length === 0 ? (
                  <EmptyStateLoader title="Empty Data set" />
                ) : (
                  <Tbody>
                    {items.map((item: string | FeedFile, index) => {
                      let type, icon, fsize, fileName;
                      type = "UNKNOWN FORMAT";
                      const isPreviewing = selectedFile === item;
                      let currentStatus = 0;
                      let isBuffering = false;

                      if (typeof item === "string") {
                        type = "dir";
                        icon = getIcon(type);
                        fileName = item;
                      } else {
                        currentStatus = status[item.data.fname];
                        isBuffering = currentStatus >= 0 ? true : false;

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
                            ${
                              isPreviewing &&
                              "file-browser__table--isPreviewing"
                            }`}
                        >
                          <span>{icon}</span>
                          <span>{fileName}</span>
                        </div>
                      );

                      const downloadComponent =
                        typeof item === "string" ? undefined : (
                          <ArrowDownTrayIcon
                            className="pf-v5-svg"
                            onClick={(e: any) => {
                              handleDownloadClick(e, item);
                            }}
                          />
                        );

                      const statusComponent =
                        typeof item !== "string" &&
                        item &&
                        currentStatus > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Progress size="small" percent={currentStatus} />
                            <XMarkIcon
                              style={{
                                color: "red",
                                marginLeft: "0.25rem",
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                FileViewerModel.abortControllers[
                                  item.data.fname
                                ].abort();
                              }}
                            />
                          </div>
                        ) : isBuffering ? (
                          <DotsIndicator />
                        ) : undefined;

                      return (
                        <Tr
                          onClick={() => {
                            dispatch(clearSelectedFile());
                            handleItem(item);
                          }}
                          key={index}
                        >
                          <Td dataLabel={columnNames.name}>
                            {fileNameComponent}
                          </Td>
                          <Td dataLabel={columnNames.size}>{fsize}</Td>
                          <Td dataLabel={columnNames.download}>
                            {downloadComponent}
                          </Td>
                          <Td dataLabel={columnNames.statusRow}>
                            {statusComponent}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                )}
              </Table>
            </DrawerContentBody>
          )}
        </DrawerContent>
      </Drawer>
    </Grid>
  );
};

export default FileBrowser;

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "dir":
      return <FolderIcon className="pf-v5-svg" />;
    case "dcm":
    case "jpg":
    case "png":
      return <PhotoIcon />;
    case "html":
    case "json":
      return <FaFileIcon />;
    case "txt":
      return <DocumentTextIcon />;
    default:
      return <FaFileIcon />;
  }
};