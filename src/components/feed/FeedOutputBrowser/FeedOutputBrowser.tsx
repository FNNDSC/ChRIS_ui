import React from "react";

import {
  Button,
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
  DrawerContentBody,
  DrawerContent,
  DrawerPanelContent,
  DrawerPanelBody,
  DrawerHead,
  Drawer,
} from "@patternfly/react-core";
import { Tree } from "antd";
import PluginViewerModal from "../../detailedView/PluginViewerModal";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getFeedTree } from "./data";
import { DataNode } from "../../../store/explorer/types";
import "./FeedOutputBrowser.scss";
import { useFeedBrowser } from "./useFeedBrowser";
import { SpinContainer } from "../../common/loading/LoadingContent";

const FileBrowser = React.lazy(() => import("./FileBrowser"));
const { DirectoryTree } = Tree;

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void;
  expandDrawer: (panel: string) => void;
  explore: boolean;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
  expandDrawer,
  explore,
}) => {
  const {
    plugins,
    selected,
    pluginFilesPayload,
    statusTitle,
    handleFileClick,
    handleFileBrowserOpen,
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handlePluginModalClose,
    pluginModalOpen,
    filesLoading,
  } = useFeedBrowser();

  const panelContent = (
    <DrawerPanelContent isResizable defaultSize="70%">
      <DrawerHead>
        <span tabIndex={0}></span>
      </DrawerHead>
      <DrawerPanelBody>
        <React.Suspense
          fallback={<SpinContainer title="Loading the File Browser" />}
        >
          {pluginFilesPayload && selected ? (
            <FileBrowser
              explore={explore}
              selected={selected}
              handleFileClick={handleFileClick}
              pluginFilesPayload={pluginFilesPayload}
              handleFileBrowserToggle={handleFileBrowserOpen}
              handleDicomViewerOpen={handleDicomViewerOpen}
              handleXtkViewerOpen={handleXtkViewerOpen}
              expandDrawer={expandDrawer}
              pluginModalOpen={pluginModalOpen}
              filesLoading={filesLoading}
            />
          ) : statusTitle && statusTitle? (
            <FetchFilesLoader title="Fetching Files" />
          ) : (
            <EmptyStateLoader
              title="Files are not available yet and are being fetched. Please give it a
        moment..."
            />
          )}
        </React.Suspense>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <div className="feed-output-browser__title">
        {explore && (
          <Button
            onClick={() => {
              expandDrawer("bottom_panel");
            }}
            variant="link"
          >
            Toggle Browser Panel
          </Button>
        )}
      </div>
      <Drawer
        isExpanded={true}
        position="right"
        className="feed-output-browser"
      >
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            {plugins && selected && (
              <SidebarTree
                plugins={plugins}
                selected={selected}
                handlePluginSelect={handlePluginSelect}
              />
            )}
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      <PluginViewerModal
        isModalOpen={pluginModalOpen}
        handleModalToggle={handlePluginModalClose}
      />
    </>
  );
};

export default FeedOutputBrowser;

const SidebarTree = (props: {
  plugins: PluginInstance[];
  selected: PluginInstance;
  handlePluginSelect: (node: PluginInstance) => void;
}) => {
  const { selected, plugins, handlePluginSelect } = props;
  const [tree, setTreeData] = React.useState<DataNode[]>();
  React.useEffect(() => {
    const pluginSidebarTree = getFeedTree(plugins);
    //@ts-ignore
    setTreeData(pluginSidebarTree);
  }, [plugins, selected]);

  return (
    <DirectoryTree
      autoExpandParent
      treeData={tree}
      defaultExpandAll
      defaultExpandParent
      expandedKeys={[selected.data.id]}
      selectedKeys={[selected.data.id]}
      onSelect={(node: any, selectedNode: any) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item);
      }}
      onExpand={(node: any, selectedNode: any) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item);
      }}
    />
  );
};

export const EmptyStateLoader = ({ title }: { title: string }) => {
  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>{title}</EmptyStateBody>
    </EmptyState>
  );
};
const FetchFilesLoader = ({ title }: { title: string }) => {
  return <SpinContainer title={title} />;
};
