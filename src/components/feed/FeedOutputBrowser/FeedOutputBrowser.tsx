import React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import JSZip from "jszip";
import {
  Grid,
  GridItem,
  Skeleton,
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
} from "@patternfly/react-core";
import { CubeIcon } from "@patternfly/react-icons";
import { Spin, Alert, Tree } from "antd";
import PluginViewerModal from "../../detailedView/PluginViewerModal";
import {
  setExplorerRequest,
  toggleViewerMode,
} from "../../../store/explorer/actions";
import { getPluginFilesRequest } from "../../../store/resources/actions";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { createTreeFromFiles, getPluginName } from "./utils";
import { PluginInstance } from "@fnndsc/chrisapi";
import { isEmpty } from "lodash";
import { getFeedTree } from "./data";
import { DataNode } from "../../../store/explorer/types";
import { useSafeDispatch } from "../../../utils";
import "./FeedOutputBrowser.scss";

const FileBrowser = React.lazy(() => import("./FileBrowser"));
const { DirectoryTree } = Tree;

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void;
  expandDrawer: (panel: string) => void;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
  expandDrawer,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);
  const dispatch = useDispatch();
  const safeDispatch = useSafeDispatch(dispatch);
  const selected = useTypedSelector((state) => state.instance.selectedPlugin);
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );
  const viewerMode = useTypedSelector((state) => state.explorer.viewerMode);

  const { data: plugins, loading } = pluginInstances;

  const pluginFilesPayload = selected && pluginFiles[selected.data.id];

  React.useEffect(() => {
    if (!pluginFilesPayload && selected) {
      safeDispatch(getPluginFilesRequest(selected));
    }
  }, [selected, pluginFilesPayload, safeDispatch]);
  if (!selected || isEmpty(pluginInstances) || loading) {
    return <LoadingFeedBrowser />;
  } else {
    const pluginName = getPluginName(selected);
    const pluginFiles = pluginFilesPayload && pluginFilesPayload.files;
    const tree: DataNode[] | null = createTreeFromFiles(selected, pluginFiles);
    const downloadAllClick = async () => {
      const zip = new JSZip();
      if (pluginFiles) {
        for (const file of pluginFiles) {
          const fileBlob = await file.getFileBlob();
          zip.file(file.data.fname, fileBlob);
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const filename = `${getPluginName(selected)}.zip`;
      FileViewerModel.downloadFile(blob, filename);
    };

    const handleFileBrowserOpen = () => {
      if (tree) {
        dispatch(setExplorerRequest(tree));
      }
      setPluginModalOpen(!pluginModalOpen);
    };

    const handleFileViewerOpen = () => {
      setPluginModalOpen(!pluginModalOpen);
      dispatch(toggleViewerMode(!viewerMode));
    };

    const handlePluginModalClose = () => {
      setPluginModalOpen(!pluginModalOpen);
      dispatch(toggleViewerMode(false));
    };

    let pluginSidebarTree;
    if (plugins && plugins.length > 0) {
      pluginSidebarTree = getFeedTree(plugins);
    }

    return (
      <>
        <Grid hasGutter className="feed-output-browser ">
          <GridItem
            className="feed-output-browser__sidebar"
            xl={2}
            xlRowSpan={12}
            xl2={2}
            xl2RowSpan={12}
            lg={2}
            lgRowSpan={12}
            md={2}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {pluginSidebarTree && (
              <DirectoryTree
                defaultExpandAll
                defaultExpandedKeys={[selected.data.id]}
                treeData={pluginSidebarTree}
                selectedKeys={[selected.data.id]}
                onSelect={(node, selectedNode) => {
                  //@ts-ignore
                  handlePluginSelect(selectedNode.node.item);
                }}
              />
            )}
          </GridItem>
          <GridItem
            className="feed-output-browser__main"
            xl={10}
            xlRowSpan={12}
            xl2={10}
            xl2RowSpan={12}
            lg={10}
            lgRowSpan={12}
            md={10}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {selected &&
            selected.data.status === "finishedSuccessfully" &&
            tree ? (
              <React.Suspense
                fallback={
                  <div>
                    <Skeleton
                      height="100%"
                      width="100%"
                      screenreaderText="Fetching the File Browser"
                    />
                  </div>
                }
              >
                <FileBrowser
                  selectedFiles={pluginFiles}
                  pluginName={pluginName}
                  root={tree[0]}
                  key={selected.data.id}
                  handleFileBrowserToggle={handleFileBrowserOpen}
                  handleFileViewerToggle={handleFileViewerOpen}
                  downloadAllClick={downloadAllClick}
                  expandDrawer={expandDrawer}
                />
              </React.Suspense>
            ) : selected.data.status === "cancelled" ||
              selected.data.status === "finishedWithError" ? (
              <EmptyStateLoader />
            ) : (
              <FetchFilesLoader />
            )}
          </GridItem>
        </Grid>
        <PluginViewerModal
          isModalOpen={pluginModalOpen}
          handleModalToggle={handlePluginModalClose}
        />
      </>
    );
  }
};

export default React.memo(FeedOutputBrowser);

/**
 *
 * Utility Components
 *
 */

const LoadingFeedBrowser = () => {
  return (
    <Grid hasGutter className="feed-output-browser">
      <GridItem className="feed-output-browser__sidebar " rowSpan={12} span={2}>
        <Skeleton
          shape="square"
          width="30%"
          screenreaderText="Loading Sidebar"
        />
      </GridItem>
      <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
        <Grid>
          <GridItem span={12} rowSpan={12}>
            <Skeleton
              height="100%"
              width="75%"
              screenreaderText="Fetching Plugin Resources"
            />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

const EmptyStateLoader = () => {
  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={CubeIcon} />
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>
        The plugin execution was either cancelled or it finished with error.
      </EmptyStateBody>
    </EmptyState>
  );
};

const FetchFilesLoader = () => {
  return (
    <Spin tip="Loading....">
      <Alert message="Retrieving Plugin's Files" type="info" />
    </Spin>
  );
};
