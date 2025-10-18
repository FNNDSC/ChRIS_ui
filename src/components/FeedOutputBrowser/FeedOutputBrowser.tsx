import type { PluginInstance } from "@fnndsc/chrisapi";
import { Alert } from "../Antd";
import { SpinContainer } from "../Common";
import "./FeedOutputBrowser.css";
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoUser from "../../reducers/user";
import { EmptyStateLoader } from "./EmptyStateLoader";
import FileBrowser from "./FileBrowser";
import { useFeedBrowser } from "./useFeedBrowser";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  handlePluginSelect: (node: PluginInstance) => void;
  explore: boolean;
  statuses: { [id: number]: string };
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { useUser, statuses } = props;
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
  } = useFeedBrowser(statuses);

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
      />
      {!isHideError && <Alert type="error" description={error?.message} />}
      <EmptyStateLoader title="" isHide={isHideEmptyStateLoader} />
    </div>
  );
};

type FetchFilesLoaderProps = {
  title: string;
  isHide?: boolean;
};

const FetchFilesLoader = (props: FetchFilesLoaderProps) => {
  const { title, isHide } = props;
  return <SpinContainer title={title} isHide={isHide} />;
};
