import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  FileBrowserFolder,
  FileBrowserFolderFile,
  type FileBrowserFolderLinkFile,
  type PluginInstance,
} from "@fnndsc/chrisapi";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Grid,
  Spinner,
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import * as DoDrawer from "../../reducers/drawer";
import * as DoExplorer from "../../reducers/explorer";
import * as DoFeed from "../../reducers/feed";
import * as DoUser from "../../reducers/user";
import useDownload from "../../store/hooks";
import { notification } from "../Antd";
import { ClipboardCopyContainer } from "../Common";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import { onMaximize, onMinimize } from "../Feeds/utilties";
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
import styles from "./FileBrowser.module.css";
import SkeletonRows from "./SkeletonRows";
import type { FilesPayload } from "./types";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

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

type Props = {
  pluginFilesPayload?: FilesPayload;
  handleFileClick: (path: string) => void;
  selected?: PluginInstance;
  currentPath: string;
  isLoading: boolean;
  handlePagination: () => void;
  fetchMore?: boolean;
  observerTarget?: React.MutableRefObject<any>;
  isHide?: boolean;

  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useExplorer: UseThunk<DoExplorer.State, TDoExplorer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const {
    pluginFilesPayload: pluginFilesPayloadProps,
    handleFileClick,
    selected,
    currentPath: additionalKey,
    observerTarget,
    fetchMore,
    handlePagination,
    isLoading,
    isHide,

    useDrawer,
    useUser,
    useExplorer,
    useFeed,
  } = props;

  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { username, isStaff } = user;

  const [classStateDrawer, doDrawer] = useDrawer;
  const drawer = getState(classStateDrawer) || DoDrawer.defaultState;
  const drawerID = getRootID(classStateDrawer);

  const [classStateExplorer, doExplorer] = useExplorer;
  const explorerID = getRootID(classStateExplorer);
  const explorer = getState(classStateExplorer) || DoExplorer.defaultState;
  const { selectedFile } = explorer;

  const [classStateFeed, _2] = useFeed;
  const feedState = getState(classStateFeed) || DoFeed.defaultState;
  const { data: feed } = feedState;

  const handleDownloadMutation = useDownload(feed);
  const [api, contextHolder] = notification.useNotification();
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;
  const pluginFilesPayload = pluginFilesPayloadProps || {};

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
      doExplorer.clearSelectedFile(explorerID);
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
      (path) => path === `${selected?.data.plugin_name}_${selected?.data.id}`,
    );

    const shouldNotClick =
      (disabledIndex > 1 && index <= disabledIndex) ||
      selected?.data.plugin_type === "fs";

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

  const className = isHide ? `file-browser ${styles.hide}` : "file-browser";

  const previewStyle: CSSProperties = {};
  if (!drawer.preview.open) {
    previewStyle.display = "none";
  }

  const isHideFileDetailView =
    isHide || drawer.preview.currentlyActive !== "preview" || !selectedFile;

  return (
    <Grid hasGutter className={className}>
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="horizontal">
        {drawer.files.open && (
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
                onMaximize={() => {
                  onMaximize(drawerID, "files", doDrawer);
                }}
                onMinimize={() => {
                  onMinimize(drawerID, doDrawer);
                }}
                maximized={drawer.files.maximized}
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
                    username={username}
                    isStaff={isStaff}
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
                          selected?.data.plugin_type === "fs" && (
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
                          <SkeletonRows />
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
                                    doExplorer.setSelectedFile(
                                      explorerID,
                                      resource,
                                    );
                                    !drawer.preview.open &&
                                      doDrawer.setFilePreviewPanel(drawerID);
                                  }}
                                  origin={origin}
                                  username={username}
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
                                        if (
                                          "path" in linkedResource.data &&
                                          linkedResource instanceof
                                            FileBrowserFolder
                                        ) {
                                          handleFileClick(
                                            linkedResource.data.path,
                                          );
                                        }
                                        // Check if it's a file (has fname property)
                                        else if (
                                          "fname" in linkedResource.data &&
                                          linkedResource instanceof
                                            FileBrowserFolderFile
                                        ) {
                                          toggleAnimation();
                                          doExplorer.setSelectedFile(
                                            explorerID,
                                            linkedResource as FileBrowserFolderFile,
                                          );
                                          !drawer.preview.open &&
                                            doDrawer.setFilePreviewPanel(
                                              drawerID,
                                            );
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
                                  username={username}
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
                                  username={username}
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

        {/* preview */}
        <Panel
          order={2}
          id="5"
          defaultSize={47}
          minSize={20}
          style={previewStyle}
        >
          <DrawerActionButton
            content="Preview"
            onMaximize={() => {
              onMaximize(drawerID, "preview", doDrawer);
            }}
            onMinimize={() => {
              onMinimize(drawerID, doDrawer);
            }}
            maximized={drawer.preview.maximized}
          />

          <FileDetailView
            selectedFile={selectedFile}
            preview="large"
            isHide={isHideFileDetailView}
            useUser={useUser}
          />
        </Panel>
      </PanelGroup>
    </Grid>
  );
};
