import type { PluginInstance } from "@fnndsc/chrisapi";
import { Alert } from "../Antd";
import "./FeedOutputBrowser.css";
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoExplorer from "../../reducers/explorer";
import type * as DoUser from "../../reducers/user";
import { EmptyStateLoader } from "./EmptyStateLoader";
import FetchFilesLoader from "./FetchFilesLoader";
import FileBrowser from "./FileBrowser";
import { useFeedBrowser } from "./useFeedBrowser";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;

type Props = {
  handlePluginSelect: (node: PluginInstance) => void;
  explore: boolean;
  statuses: { [id: number]: string };
  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useExplorer: UseThunk<DoExplorer.State, TDoExplorer>;
};

export default (props: Props) => {
  const { useUser, useDrawer, useExplorer, statuses } = props;
  const {
    selected,
    pluginFilesPayload,
    handleFileClick,
    filesLoading,
    isError,
    error,
    currentPath,
    fetchMore,
    observerTarget,
    handlePagination,
    finished,
  } = useFeedBrowser(statuses, useDrawer);

  const isHideFetchFilesLoader = finished;
  const isHideFileBrowser =
    !finished || !pluginFilesPayload || !selected || isError;
  const isHideError = !finished || !isError;
  const isHideEmptyStateLoader =
    !isHideFetchFilesLoader || !isHideFileBrowser || !isHideError;

  return (
    <div style={{ height: "100%" }} className="feed-output-browser">
      <FetchFilesLoader
        title="Plugin executing. Files will be fetched when plugin completes"
        isHide={isHideFetchFilesLoader}
      />
      <FileBrowser
        selected={selected}
        handleFileClick={handleFileClick}
        pluginFilesPayload={pluginFilesPayload}
        currentPath={currentPath}
        fetchMore={fetchMore}
        observerTarget={observerTarget}
        handlePagination={handlePagination}
        isLoading={filesLoading}
        isHide={isHideFileBrowser}
        useUser={useUser}
        useDrawer={useDrawer}
        useExplorer={useExplorer}
      />
      {!isHideError && <Alert type="error" description={error?.message} />}
      <EmptyStateLoader title="" isHide={isHideEmptyStateLoader} />
    </div>
  );
};
