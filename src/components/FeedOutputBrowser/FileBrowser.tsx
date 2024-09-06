import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
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
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFilePreviewPanel } from "../../store/drawer/drawerSlice";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../store/explorer/explorerSlice";
import useDownload, { useTypedSelector } from "../../store/hooks";
import { notification } from "../Antd";
import { ClipboardCopyContainer } from "../Common";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import { handleMaximize, handleMinimize } from "../Feeds/utilties";
import { HomeIcon } from "../Icons";
import {
  getFileName,
  getLinkFileName,
} from "../NewLibrary/components/FileCard";
import { getFolderName } from "../NewLibrary/components/FolderCard";
import {
  FileRow,
  FolderRow,
  LinkRow,
} from "../NewLibrary/components/LibraryTable";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext } from "../NewLibrary/context";
import FileDetailView from "../Preview/FileDetailView";
import XtkViewer from "../XtkViewer/XtkViewer";
import type { FileBrowserProps } from "./types";

const previewAnimation = [{ opacity: "0.0" }, { opacity: "1.0" }];

const previewAnimationTiming = {
  duration: 1000,
  iterations: 1,
};
const columnNames = {
  name: "Name",
  created: "Created",
  creator: "Creator",
  size: "Size",
};

const FileBrowser = (props: FileBrowserProps) => {
  const dispatch = useDispatch();
  const feed = useTypedSelector((state) => state.feed.currentFeed.data);
  const handleDownloadMutation = useDownload(feed);
  const [api, contextHolder] = notification.useNotification();
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;

  const {
    pluginFilesPayload,
    handleFileClick,
    selected,

    currentPath: additionalKey,
  } = props;
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const drawerState = useTypedSelector((state) => state.drawers);
  const username = useTypedSelector((state) => state.user.username);
  const { folderFiles, linkFiles, children, path } = pluginFilesPayload;
  const breadcrumb = path.split("/");
  const currentPath = `home/${username}/feeds/feed_${feed?.data.id}/${selected?.data.plugin_name}_${selected?.data.id}/data`;

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

  const generateBreadcrumb = (value: string, index: number) => {
    const onClick = () => {
      dispatch(clearSelectedFile());
      if (index === breadcrumb.length - 1) {
        return;
      }
      const findIndex = breadcrumb.findIndex((path) => path === value);
      if (findIndex !== -1) {
        const newPathList = breadcrumb.slice(0, findIndex + 1);
        handleFileClick(newPathList.join("/"));
      }
    };

    // This is somewhat tricky. do not allow the user to click paths before the selected plugin.
    const disabledIndex = breadcrumb.findIndex(
      (path) => path === `${selected.data.plugin_name}_${selected.data.id}`,
    );
    // If this selected plugin is of the type fs, assume that this is the first node of the tree and could have link files. All the paths
    // that the user navigates to should not be clickable
    const shouldNotClick =
      (disabledIndex > 1 && index <= disabledIndex) ||
      selected.data.plugin_type === "fs";

    return (
      <BreadcrumbItem
        showDivider={true}
        key={index}
        onClick={() => {
          shouldNotClick ? undefined : onClick();
        }}
        to={index === breadcrumb.length - 1 || shouldNotClick ? undefined : "#"}
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
            isPublic={feed?.data.public}
          />
        )}
        {drawerState.preview.currentlyActive === "xtk" && <XtkViewer />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Grid hasGutter className="file-browser">
      {contextHolder}
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
              <Operations
                customClassName={{ toolbar: "remove-toolbar-padding" }}
                origin={{
                  type: OperationContext.FILEBROWSER,
                  additionalKeys: [additionalKey],
                }}
                computedPath={path}
                folderList={pluginFilesPayload.folderList}
              />
              <div className="file-browser__header">
                <div className="file-browser__header--breadcrumbContainer">
                  <ClipboardCopyContainer path={path} />
                  <Breadcrumb>{breadcrumb.map(generateBreadcrumb)}</Breadcrumb>
                </div>

                <div>
                  {path !== currentPath &&
                    selected.data.plugin_type === "fs" && (
                      <Tooltip
                        content={<span>Go back to the base directory</span>}
                      >
                        <Button
                          onClick={() => handleFileClick(currentPath)}
                          variant="link"
                          icon={<HomeIcon />}
                        >
                          Back
                        </Button>
                      </Tooltip>
                    )}
                </div>
              </div>
              <Table variant="compact">
                <Thead aria-label="file-browser-table">
                  <Tr>
                    <Th />
                    <Th aria-label="file-name">{columnNames.name}</Th>
                    <Th aria-label="file-creator">{columnNames.created}</Th>
                    <Th aria-label="file-owner">{columnNames.creator}</Th>
                    <Th aria-label="file-size">{columnNames.size}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {folderFiles.map((resource: FileBrowserFolderFile, index) => {
                    return (
                      <FileRow
                        rowIndex={index}
                        key={resource.data.fname}
                        resource={resource}
                        name={getFileName(resource)}
                        date={resource.data.creation_date}
                        owner={resource.data.owner_username}
                        size={resource.data.fsize}
                        computedPath={path}
                        handleFolderClick={() => {
                          return;
                        }}
                        handleFileClick={() => {
                          toggleAnimation();
                          dispatch(
                            setSelectedFile(resource as FileBrowserFolderFile),
                          );
                          !drawerState.preview.open &&
                            dispatch(setFilePreviewPanel());
                        }}
                      />
                    );
                  })}
                  {linkFiles.map(
                    (resource: FileBrowserFolderLinkFile, index) => {
                      return (
                        <LinkRow
                          rowIndex={index}
                          key={resource.data.path}
                          resource={resource}
                          name={getLinkFileName(resource)}
                          date={resource.data.creation_date}
                          owner={resource.data.owner_username}
                          size={resource.data.fsize}
                          computedPath={path}
                          handleFolderClick={() => {
                            return;
                          }}
                          handleFileClick={() => {
                            handleFileClick(resource.data.path);
                          }}
                        />
                      );
                    },
                  )}

                  {children.map((resource: FileBrowserFolder, index) => {
                    return (
                      <FolderRow
                        rowIndex={index}
                        key={resource.data.path}
                        resource={resource}
                        name={getFolderName(resource, path)}
                        date={resource.data.creation_date}
                        owner=" "
                        size={0}
                        computedPath={path}
                        handleFolderClick={() =>
                          handleFileClick(resource.data.path)
                        }
                        handleFileClick={() => {
                          return;
                        }}
                      />
                    );
                  })}
                </Tbody>
              </Table>
            </DrawerContentBody>
          )}
        </DrawerContent>
      </Drawer>
    </Grid>
  );
};

export default FileBrowser;
