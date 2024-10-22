import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Grid,
  Tooltip,
  Skeleton,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { setFilePreviewPanel } from "../../store/drawer/drawerSlice";
import {
  clearSelectedFile,
  setSelectedFile,
} from "../../store/explorer/explorerSlice";
import useDownload, { useAppDispatch, useAppSelector } from "../../store/hooks";
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
  const dispatch = useAppDispatch();
  const feed = useAppSelector((state) => state.feed.currentFeed.data);
  const handleDownloadMutation = useDownload(feed);
  const [api, contextHolder] = notification.useNotification();
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;
  const {
    pluginFilesPayload,
    handleFileClick,
    selected,
    currentPath: additionalKey,
    observerTarget,
    fetchMore,
    handlePagination,
    isLoading,
  } = props;

  const selectedFile = useAppSelector((state) => state.explorer.selectedFile);
  const drawerState = useAppSelector((state) => state.drawers);
  const username = useAppSelector((state) => state.user.username);
  const { subFoldersMap, linkFilesMap, filesMap } = pluginFilesPayload;
  const breadcrumb = additionalKey.split("/");
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
  }, [api, isSuccess, isError, downloadError, handleDownloadMutation]);

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

  const origin = {
    type: OperationContext.FILEBROWSER,
    additionalKeys: [additionalKey],
  };

  return (
    <Grid hasGutter className="file-browser">
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="horizontal">
        {/* Left Panel: File Browser */}
        {drawerState.files.open && (
          <>
            <Panel
              className="custom-panel"
              order={1}
              id="4"
              defaultSize={53}
              minSize={20}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* Drawer Action Button for Files */}
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

              <>
                {/* Sticky Container */}
                <div className="sticky-container">
                  <Operations
                    customClassName={{
                      toolbar: "remove-toolbar-padding",
                    }}
                    customStyle={{
                      toolbar: {
                        backgroundColor: "inherit",
                      },
                    }}
                    origin={origin}
                    computedPath={additionalKey}
                    folderList={pluginFilesPayload.folderList}
                  />
                  <div className="file-browser__header">
                    <div className="file-browser__header--breadcrumbContainer">
                      <ClipboardCopyContainer path={additionalKey} />
                      <Breadcrumb>
                        {breadcrumb.map(generateBreadcrumb)}
                      </Breadcrumb>
                    </div>
                    {/* Optional Back Button */}
                    <div>
                      {additionalKey !== currentPath &&
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
                </div>
                {/* Scrollable Content */}

                <div style={{ flex: 1, overflow: "auto" }}>
                  <Table
                    style={{
                      backgroundColor: "inherit",
                    }}
                    variant="compact"
                    isStickyHeader={true}
                  >
                    <Thead aria-label="file-browser-table">
                      <Tr>
                        <Th aria-label="file-selection-checkbox" />
                        <Th aria-label="file-name" width={40}>
                          {columnNames.name}
                        </Th>
                        <Th aria-label="file-creator" width={20}>
                          {columnNames.created}
                        </Th>

                        <Th aria-label="file-size" width={20}>
                          {columnNames.size}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {isLoading ? (
                        renderSkeletonRows()
                      ) : (
                        <>
                          {filesMap?.map(
                            (resource: FileBrowserFolderFile, index) => (
                              <FileRow
                                key={resource.data.fname}
                                rowIndex={index}
                                resource={resource}
                                name={getFileName(resource)}
                                date={resource.data.creation_date}
                                owner={resource.data.owner_username}
                                size={resource.data.fsize}
                                computedPath={additionalKey}
                                handleFolderClick={() => {}}
                                handleFileClick={() => {
                                  toggleAnimation();
                                  dispatch(setSelectedFile(resource));
                                  !drawerState.preview.open &&
                                    dispatch(setFilePreviewPanel());
                                }}
                                origin={origin}
                              />
                            ),
                          )}
                          {linkFilesMap?.map(
                            (resource: FileBrowserFolderLinkFile, index) => (
                              <LinkRow
                                key={resource.data.path}
                                rowIndex={index}
                                resource={resource}
                                name={getLinkFileName(resource)}
                                date={resource.data.creation_date}
                                owner={resource.data.owner_username}
                                size={resource.data.fsize}
                                computedPath={additionalKey}
                                handleFolderClick={() => {}}
                                handleFileClick={() =>
                                  handleFileClick(resource.data.path)
                                }
                                origin={origin}
                              />
                            ),
                          )}
                          {subFoldersMap?.map(
                            (resource: FileBrowserFolder, index) => (
                              <FolderRow
                                key={resource.data.path}
                                rowIndex={index}
                                resource={resource}
                                name={getFolderName(resource, additionalKey)}
                                date={resource.data.creation_date}
                                owner=" "
                                size={0}
                                computedPath={additionalKey}
                                handleFolderClick={() =>
                                  handleFileClick(resource.data.path)
                                }
                                handleFileClick={() => {}}
                                origin={origin}
                              />
                            ),
                          )}
                        </>
                      )}
                    </Tbody>
                  </Table>
                  {/* Load More Button */}
                  {fetchMore && !isLoading && (
                    <Button onClick={handlePagination} variant="link">
                      Load more data...
                    </Button>
                  )}
                  {/* Observer Target */}
                  <div
                    style={{ height: "1px", marginTop: "10px" }}
                    ref={observerTarget}
                  />
                </div>
              </>
            </Panel>
            {/* Resize Handle */}
            <PanelResizeHandle className="ResizeHandle" />
          </>
        )}

        {/* Right Panel: Preview Panel */}
        {drawerState.preview.open && (
          <Panel order={2} id="5" defaultSize={47} minSize={20}>
            {/* Drawer Action Button for Preview */}
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

            {drawerState.preview.currentlyActive === "preview" &&
              selectedFile && (
                <FileDetailView
                  gallery={true}
                  selectedFile={selectedFile}
                  preview="large"
                  list={pluginFilesPayload.filesMap}
                  fetchMore={fetchMore}
                  handlePagination={handlePagination}
                  filesLoading={isLoading}
                />
              )}
            {drawerState.preview.currentlyActive === "xtk" && <XtkViewer />}
          </Panel>
        )}
      </PanelGroup>
    </Grid>
  );
};

export default FileBrowser;

const renderSkeletonRows = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <Tr
        key={`skeleton-row-${
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          index
        }`}
      >
        <Th>
          <Skeleton width="20px" />
        </Th>
        <Th>
          <Skeleton width="100px" />
        </Th>
        <Th>
          <Skeleton width="80px" />
        </Th>
        <Th>
          <Skeleton width="80px" />
        </Th>
        <Th>
          <Skeleton width="60px" />
        </Th>
      </Tr>
    ))}
  </>
);
