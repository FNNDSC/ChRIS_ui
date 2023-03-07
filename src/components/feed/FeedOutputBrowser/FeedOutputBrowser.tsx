import React from "react";

import {
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
  DrawerActions,
  DrawerCloseButton,
} from "@patternfly/react-core";
import { Tree } from "antd";
import PluginViewerModal from "../../detailedView/PluginViewerModal";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getFeedTree } from "./data";
import { DataNode } from "../../../store/explorer/types";
import { useFeedBrowser } from "./useFeedBrowser";
import { SpinContainer } from "../../common/loading/LoadingContent";
import {
  ButtonWithTooltip,
  DrawerCloseButtonWithTooltip,
} from "../../common/button";
import "./FeedOutputBrowser.scss";

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
    expandSidebar,
    plugins,
    selected,
    pluginFilesPayload,
    statusTitle,
    handleFileClick,
    handleFileBrowserOpen,
    handleDicomViewerOpen,
    handleSidebarDrawer,
    handleXtkViewerOpen,
    handlePluginModalClose,
    pluginModalOpen,
    filesLoading,
  } = useFeedBrowser();

  const panelContent = (
    <DrawerPanelContent isResizable defaultSize="15%">
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButtonWithTooltip
            content={<span>Close Tree View</span>}
            onClick={() => {
              handleSidebarDrawer();
            }}
          />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        {plugins && selected && (
          <SidebarTree
            plugins={plugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      {explore && (
        <div className="feedButton">
          <ButtonWithTooltip
            style={{
              background: "none",
            }}
            icon={<BrowserCloseIcon />}
            onClick={() => {
              expandDrawer("bottom_panel");
            }}
            content={<span>Collapse the File Browser Panel</span>}
            position="top"
            variant="link"
          />
        </div>
      )}

      <Drawer
        isExpanded={expandSidebar}
        position="left"
        isInline
        className="feed-output-browser"
      >
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            <React.Suspense
              fallback={<SpinContainer title="Loading the File Browser" />}
            >
              {pluginFilesPayload && selected ? (
                <FileBrowser
                  explore={explore}
                  expandSidebar={expandSidebar}
                  selected={selected}
                  handleFileClick={handleFileClick}
                  pluginFilesPayload={pluginFilesPayload}
                  handleFileBrowserToggle={handleFileBrowserOpen}
                  handleDicomViewerOpen={handleDicomViewerOpen}
                  handleXtkViewerOpen={handleXtkViewerOpen}
                  handleSidebarDrawer={handleSidebarDrawer}
                  expandDrawer={expandDrawer}
                  pluginModalOpen={pluginModalOpen}
                  filesLoading={filesLoading}
                />
              ) : statusTitle && statusTitle ? (
                <FetchFilesLoader title="Fetching Files" />
              ) : (
                <EmptyStateLoader title="Fetching Files" />
              )}
            </React.Suspense>
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

const BrowserCloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      stroke="#004080"
      strokeWidth="1"
    >
      <g fill="#2b9af3">
        <path d="M9.5 3h-6a1.5 1.5 0 0 0 0 3h6a1.5 1.5 0 0 0 0-3zM6 5H3.466A.465.465 0 0 1 3 4.534v-.068C3 4.208 3.208 4 3.466 4H6v1zm4-.466A.465.465 0 0 1 9.534 5H7V4h2.534c.258 0 .466.208.466.466v.068z" />
        <path d="M30 0H2a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h15v-1H3a2 2 0 0 1-2-2V9h30v8h1V2a2 2 0 0 0-2-2zm1 8H1V3a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v5z" />
        <path d="M28.5 3h-15a1.5 1.5 0 0 0 0 3h15a1.5 1.5 0 0 0 0-3zm.5 1.534a.465.465 0 0 1-.466.466H13.466A.465.465 0 0 1 13 4.534v-.068c0-.258.208-.466.466-.466h15.069c.257 0 .465.208.465.466v.068zM29.121 26.197 25 30.343V16.5a.5.5 0 0 0-1 0v13.793l-4.121-4.096c-.195-.195-.524-.195-.72 0s-.202.512-.006.707l4.943 4.95a.486.486 0 0 0 .174.11c.01.004.021.003.032.006.047.015.095.03.148.03.009 0 .016-.005.025-.005h.001a.492.492 0 0 0 .379-.142l4.95-4.95a.5.5 0 0 0 0-.707.472.472 0 0 0-.684.001z" />
      </g>
    </svg>
  );
};
