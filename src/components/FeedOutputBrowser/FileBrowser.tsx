import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
  Grid,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { notification } from "antd";
import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFilePreviewPanel } from "../../store/drawer/actions";
import { setSelectedFile } from "../../store/explorer/actions";
import { useTypedSelector } from "../../store/hooks";
import { ClipboardCopyContainer, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import { handleMaximize, handleMinimize } from "../Feeds/utilties";
import {
  DownloadIcon,
  ExternalLinkSquareAltIcon,
  FileIcon,
  FileImageIcon,
  FilePdfIcon,
  FileTxtIcon,
  FolderIcon,
} from "../Icons";
import useDownload from "../NewLibrary/useDownloadHook";
import FileDetailView from "../Preview/FileDetailView";
import XtkViewer from "../XtkViewer/XtkViewer";
import type { FileBrowserProps } from "./types";
import { bytesToSize } from "./utilities";

export const getFileName = (name: string) => {
  return name.split("/").slice(-1).join("");
};

const FileBrowser = (props: FileBrowserProps) => {
  const [api, contextHolder] = notification.useNotification();
  const { isDarkTheme } = useContext(ThemeContext);
  const { pluginFilesPayload, handleFileClick, filesLoading } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const drawerState = useTypedSelector((state) => state.drawers);
  const dispatch = useDispatch();
  const { folderFiles, linkFiles, children, path } = pluginFilesPayload;
  const columnNames = {
    name: "Name",
    size: "Size",
    download: "",
  };
  const breadcrumb = path.split("/");
  const handleDownloadMutation = useDownload();
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;

  useEffect(() => {
    if (isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });

      setTimeout(() => {
        handleDownloadMutation.reset();
      }, 1000);
    }

    if (isError) {
      api.error({
        message: "Download Error",
        //@ts-ignore
        description: downloadError.message,
      });
    }
  }, [isSuccess, isError, downloadError]);

  const previewAnimation = [{ opacity: "0.0" }, { opacity: "1.0" }];

  const previewAnimationTiming = {
    duration: 1000,
    iterations: 1,
  };

  const generateBreadcrumb = (value: string, index: number) => {
    const onClick = () => {
      if (index === breadcrumb.length - 1) {
        return;
      }
      const findIndex = breadcrumb.findIndex((path) => path === value);
      if (findIndex !== -1) {
        const newPathList = breadcrumb.slice(0, findIndex + 1);
        handleFileClick(newPathList.join("/"));
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

  const handleItem = (item: any, type: string) => {
    if (type === "link" || type === "folder") {
      handleFileClick(item.data.path);
    }

    if (type === "file") {
      toggleAnimation();
      dispatch(setSelectedFile(item));
      !drawerState.preview.open && dispatch(setFilePreviewPanel());
    }
  };

  const previewPanel = (
    <DrawerPanelContent
      className="file-browser__previewPanel"
      isResizable
      defaultSize={!drawerState.files.open ? "100%" : "47%"}
      minSize={"25%"}
    >
      <DrawerActionButton
        content="Preview"
        handleMaximize={() => {
          handleMaximize("preview", dispatch);
        }}
        handleMinimize={() => {
          handleMinimize("preview", dispatch);
        }}
        maximized={drawerState.preview.maximized}
      />
      <DrawerPanelBody className="file-browser__drawerbody">
        {drawerState.preview.currentlyActive === "preview" && selectedFile && (
          <FileDetailView
            gallery={true}
            selectedFile={selectedFile}
            preview="large"
          />
        )}
        {drawerState.preview.currentlyActive === "xtk" && <XtkViewer />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  const tableRowItem = (item: any, type: string) => {
    let iconType: string;
    let icon: React.ReactNode = null;
    let fsize = " ";
    let fileName = "";
    iconType = "UNKNOWN FORMAT";
    const pathList =
      type === "folder" || type === "link"
        ? item.data.path.split("/")
        : item.data.fname.split("/");

    fileName = pathList[pathList.length - 1];
    if (type === "file" && fileName.indexOf(".") > -1) {
      iconType = getFileName(fileName)[0].toUpperCase();
      fsize = bytesToSize(item.data.fsize);
    } else {
      iconType = type;
    }
    const isPreviewing = selectedFile === item;
    const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

    icon = getIcon(iconType);
    const fileNameComponent = (
      <div
        className={"file-browser__table--fileName"}
        style={{
          background: isPreviewing ? backgroundColor : "",
        }}
      >
        <span>{icon}</span>
        <span>{fileName}</span>
      </div>
    );
    const downloadComponent =
      type !== "file" ? undefined : (
        <Button
          variant="plain"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDownloadMutation.mutate(item);
          }}
          icon={<DownloadIcon />}
        />
      );
    return (
      <Tr
        onClick={() => {
          handleItem(item, type);
        }}
        key={type === "file" ? item.data.fname : item.data.path} // Assuming 'item' has an 'id' property
      >
        <Td dataLabel={columnNames.name}>{fileNameComponent}</Td>
        <Td dataLabel={columnNames.size}>{fsize}</Td>
        <Td dataLabel={columnNames.download}>{downloadComponent}</Td>
      </Tr>
    );
  };

  return (
    <Grid hasGutter className="file-browser">
      <Drawer position="right" isInline isExpanded={true}>
        <DrawerContent
          panelContent={drawerState.preview.open ? previewPanel : null}
          className="file-browser__firstGrid"
        >
          <DrawerActionButton
            content="Files"
            handleMaximize={() => {
              handleMaximize("files", dispatch);
            }}
            handleMinimize={() => {
              handleMinimize("files", dispatch);
            }}
            maximized={drawerState.files.maximized}
          />
          {drawerState.files.open && (
            <DrawerContentBody>
              <div className="file-browser__header">
                <div className="file-browser__header--breadcrumbContainer">
                  <ClipboardCopyContainer path={path} />
                  <Breadcrumb>{breadcrumb.map(generateBreadcrumb)}</Breadcrumb>
                </div>
              </div>
              <Table aria-label="file-browser-table" variant="compact">
                <Thead className="file-browser-table--head">
                  <Tr>
                    <Th>{columnNames.name}</Th>
                    <Th>{columnNames.size}</Th>
                    <Th>{columnNames.download}</Th>
                  </Tr>
                </Thead>
                {filesLoading ? (
                  <SpinContainer title="Fetching Files for this path..." />
                ) : (
                  <Tbody>
                    {contextHolder}
                    {folderFiles.map((folderFile) => {
                      const component = tableRowItem(folderFile, "file");
                      return component;
                    })}
                    {linkFiles.map((linkFile) => {
                      const component = tableRowItem(linkFile, "link");
                      return component;
                    })}
                    {children.map((child) => {
                      const component = tableRowItem(child, "folder");
                      return component;
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
      return <FolderIcon />;
    case "dcm":
    case "jpg":
    case "png":
      return <FileImageIcon />;
    case "html":
    case "json":
      return <FileIcon />;
    case "txt":
      return <FileTxtIcon />;
    case "pdf":
      return <FilePdfIcon />;
    case "link":
      return <ExternalLinkSquareAltIcon />;
    case "folder":
      return <FolderIcon />;
    default:
      return <FileIcon />;
  }
};
