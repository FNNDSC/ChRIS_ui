import type { FeedFile } from "@fnndsc/chrisapi";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  FolderIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
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
import FaFileIcon from "@patternfly/react-icons/dist/esm/icons/file-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setFilePreviewPanel } from "../../store/drawer/actions";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../store/explorer/actions";
import { useTypedSelector } from "../../store/hooks";
import { ClipboardCopyContainer, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import { handleMaximize, handleMinimize } from "../Feeds/utilties";
import FileDetailView from "../Preview/FileDetailView";
import XtkViewer from "../XtkViewer/XtkViewer";
import { EmptyStateLoader } from "./FeedOutputBrowser";
import type { FileBrowserProps } from "./types";
import { bytesToSize } from "./utilities";
import { getFileExtension } from "../../api/model";

const getFileName = (name: string) => {
  return name.split("/").slice(-1).join("");
};

const FileBrowser = (props: FileBrowserProps) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const { pluginFilesPayload, handleFileClick, selected, filesLoading } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const drawerState = useTypedSelector((state) => state.drawers);
  const feed = useTypedSelector((state) => state.feed.currentFeed.data);
  const dispatch = useDispatch();
  const [currentRowIndex, setCurrentRowIndex] = React.useState(0);
  const { files, folders, path } = pluginFilesPayload;
  const columnNames = {
    name: "Name",
    size: "Size",
    download: "",
  };
  const items = files && folders ? [...files, ...folders] : [];
  const { id, plugin_name } = selected.data;
  const pathSplit = path?.split(`/${plugin_name}_${id}/`);
  const breadcrumb = path ? pathSplit[1].split("/") : [];

  const makeDataSourcePublic = async () => {
    // Implement logic to make the data source public
    await feed?.put({ public: true });
  };

  const makeDataSourcePrivate = async () => {
    // Implement logic to make the data source private again
    await feed?.put({ public: false });
  };

  const handleDownloadClick = async (item: FeedFile) => {
    if (item) {
      try {
        const fileName = getFileName(item.data.fname);

        const url = item.url;
        const client = ChrisAPIClient.getClient();
        const token = client.auth.token;
        // This is highly inconsistent and needs to be investigated further
        const authorizedUrl = `${url}${fileName}?token=${token}`; // Add token as a query parameter
        const privateFeed = feed?.data.public === false;
        // Make the data source public
        privateFeed && (await makeDataSourcePublic());

        // Create an anchor element
        const link = document.createElement("a");
        link.href = authorizedUrl;
        link.download = fileName; // Set the download attribute to specify the filename

        // Append the anchor element to the document body
        document.body.appendChild(link);

        // Programmatically trigger the download
        link.click();

        // Remove the anchor element from the document body after the download is initiated
        document.body.removeChild(link);

        // Make the data source private again after the download is done
        privateFeed && (await makeDataSourcePrivate());

        return item;
      } catch (e) {
        throw e;
      }
    }
  };

  const downloadMutation = useMutation({
    mutationFn: (item: FeedFile) => handleDownloadClick(item),
  });

  const { isSuccess, isError, error: downloadError, data } = downloadMutation;
  const [api, contextHolder] = notification.useNotification();
  React.useEffect(() => {
    if (data) {
      const fileName = getFileName(data.data.fname);
      if (isSuccess) {
        api.success({
          message: `Download ${fileName} Successfully`,
        });
      }

      if (isError) {
        api.error({
          message: `Download Error: ${fileName}`,
          //@ts-ignore
          description: downloadError.message,
        });
      }

      setTimeout(() => {
        downloadMutation.reset();
      }, 1000);
    }
  }, [isSuccess, isError, downloadError]);

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
      }
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
      !drawerState.preview.open && dispatch(setFilePreviewPanel());
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
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            selectedFile={selectedFile}
            preview="large"
          />
        )}
        {drawerState.preview.currentlyActive === "xtk" && <XtkViewer />}
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
                  </Tr>
                </Thead>
                {filesLoading ? (
                  <SpinContainer title="Fetching Files for this path..." />
                ) : !filesLoading && items.length === 0 ? (
                  <EmptyStateLoader title="Empty Data set" />
                ) : (
                  <Tbody>
                    {contextHolder}
                    {items.map((item: string | FeedFile, index) => {
                      let type: string;
                      let icon: React.ReactNode;
                      let fsize: string;
                      let fileName: string;
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

                      const backgroundColor = isDarkTheme
                        ? "#002952"
                        : "#E7F1FA";

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
                        typeof item === "string" ? undefined : (
                          <Button
                            variant="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadMutation.mutate(item);
                            }}
                            icon={<ArrowDownTrayIcon className="pf-v5-svg" />}
                          />
                        );

                      return (
                        <Tr
                          onClick={() => {
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
