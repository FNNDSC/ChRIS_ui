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
  Spinner,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useEffect, useMemo, useRef } from "react";
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
  const { subFoldersMap, linkFilesMap, filesMap, folderList } =
    pluginFilesPayload;
  const breadcrumb = useMemo(() => additionalKey.split("/"), [additionalKey]);
  const currentPath = `home/${username}/feeds/feed_${feed?.data.id}/${selected?.data.plugin_name}_${selected?.data.id}/data`;
  const noFiles = useMemo(
    () =>
      filesMap?.length === 0 &&
      subFoldersMap?.length === 0 &&
      linkFilesMap?.length === 0,
    [filesMap, subFoldersMap, linkFilesMap],
  );

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

    const disabledIndex = breadcrumb.findIndex(
      (path) => path === `${selected.data.plugin_name}_${selected.data.id}`,
    );

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
      .querySelector(".large-preview")
      ?.animate(previewAnimation, previewAnimationTiming);
  };

  const origin = {
    type: OperationContext.FILEBROWSER,
    additionalKeys: [additionalKey],
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Grid hasGutter className="file-browser">
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="horizontal">
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
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
                    folderList={folderList}
                  />
                  <div className="file-browser-header">
                    <div className="file-browser-header-row">
                      <div className="file-browser-navigation">
                        <Tooltip
                          content={
                            <div className="file-browser-breadcrumb-popover">
                              <div className="file-browser-breadcrumb-row">
                                <ClipboardCopyContainer path={additionalKey} />
                                <Breadcrumb>
                                  {breadcrumb.map(generateBreadcrumb)}
                                </Breadcrumb>
                              </div>
                            </div>
                          }
                          position="bottom"
                          maxWidth="80vw"
                        >
                          <Button
                            variant="link"
                            className="file-browser-path-button"
                          >
                            <span className="file-browser-label">
                              Show current path
                            </span>
                          </Button>
                        </Tooltip>

                        {additionalKey !== currentPath &&
                          selected.data.plugin_type === "fs" && (
                            <Tooltip content="Return to the plugin's root directory">
                              <Button
                                onClick={() => handleFileClick(currentPath)}
                                variant="link"
                                className="file-browser-path-button"
                              >
                                <span className="file-browser-label">
                                  Go to root
                                </span>
                              </Button>
                            </Tooltip>
                          )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minHeight: "32px",
                          minWidth: "120px",
                        }}
                      >
                        {isLoading && (
                          <>
                            <Spinner size="sm" aria-label="Loading files" />
                            <span>Loading files...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="file-list"
                    style={{
                      flexGrow: 1,
                      minHeight: 0,
                      overflow: "auto",
                    }}
                    ref={scrollRef}
                  >
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
                        {isLoading && noFiles ? (
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
                                  handleFileClick={async () => {
                                    try {
                                      const linkedResource =
                                        await resource.getLinkedResource();

                                      if (linkedResource) {
                                        // Check if it's a folder (has path property)
                                        if ("path" in linkedResource.data) {
                                          handleFileClick(
                                            linkedResource.data.path,
                                          );
                                        }
                                        // Check if it's a file (has fname property)
                                        else if (
                                          "fname" in linkedResource.data
                                        ) {
                                          toggleAnimation();
                                          dispatch(
                                            setSelectedFile(
                                              linkedResource as FileBrowserFolderFile,
                                            ),
                                          );
                                          !drawerState.preview.open &&
                                            dispatch(setFilePreviewPanel());
                                        }
                                      }
                                    } catch (error) {
                                      // TODO: Handle error
                                      console.error(
                                        "Error handling link file:",
                                        error,
                                      );
                                    }
                                  }}
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
                    {fetchMore && (
                      <div
                        ref={observerTarget}
                        style={{
                          height: "50px",
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "10px 0",
                        }}
                        data-testid="observer-target"
                      >
                        {isLoading ? (
                          <Spinner size="sm" aria-label="Loading more files" />
                        ) : (
                          <Button onClick={handlePagination} variant="link">
                            Load more data...
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            </Panel>
            <PanelResizeHandle className="ResizeHandle" />
          </>
        )}
        {drawerState.preview.open && (
          <Panel order={2} id="5" defaultSize={47} minSize={20}>
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
                <FileDetailView selectedFile={selectedFile} preview="large" />
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
      <Tr key={`skeleton-row-${index}`}>
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
