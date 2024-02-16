import React from "react";
import {
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
  DrawerContentBody,
  DrawerContent,
  DrawerPanelContent,
  Drawer,
} from "@patternfly/react-core";
import { Tree } from "antd";
import type { PluginInstance } from "@fnndsc/chrisapi";
import FileBrowser from "./FileBrowser";
import { getFeedTree } from "./data";
import { DataNode } from "../../store/explorer/types";
import { useFeedBrowser } from "./useFeedBrowser";
import { SpinContainer } from "../Common";
import { DrawerActionButton } from "../Feeds/DrawerUtils";
import "./FeedOutputBrowser.css";

const { DirectoryTree } = Tree;

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void;
  explore: boolean;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
}) => {
  const {
    plugins,
    selected,
    pluginFilesPayload,
    statusTitle,
    handleFileClick,
    handleSidebarDrawer,
    filesLoading,
    sidebarStatus,
    filesStatus,
    previewStatus,
  } = useFeedBrowser();

  const panelContent = (
    <DrawerPanelContent
      isResizable
      defaultSize={
        filesStatus.open === false && previewStatus.open == false
          ? "100%"
          : "15%"
      }
    >
      <DrawerActionButton
        content="Directory"
        handleMaximize={() => {
          handleSidebarDrawer("maximized");
        }}
        handleMinimize={() => {
          handleSidebarDrawer("minimized");
        }}
        maximized={sidebarStatus.maximized}
      />

      {plugins && selected && (
        <SidebarTree
          plugins={plugins}
          selected={selected}
          handlePluginSelect={handlePluginSelect}
        />
      )}
    </DrawerPanelContent>
  );

  return (
    <Drawer
      position="left"
      isExpanded={filesStatus || sidebarStatus || previewStatus ? true : false}
      isInline
      className="feed-output-browser"
    >
      <DrawerContent panelContent={sidebarStatus.open && panelContent}>
        <DrawerContentBody>
          {pluginFilesPayload && selected ? (
            <FileBrowser
              selected={selected}
              handleFileClick={handleFileClick}
              pluginFilesPayload={pluginFilesPayload}
              filesLoading={filesLoading}
            />
          ) : statusTitle && statusTitle ? (
            <FetchFilesLoader title="Fetching Files" />
          ) : (
            <EmptyStateLoader title="Fetching Files" />
          )}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
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
  }, [plugins]);

  //@ts-ignore
  return (
    <DirectoryTree
      autoExpandParent
      treeData={tree}
      defaultExpandAll
      defaultExpandParent
      expandedKeys={[selected.data.id]}
      selectedKeys={[selected.data.id]}
      onSelect={(_node: any, selectedNode: any) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item);
      }}
      onExpand={(_node: any, selectedNode: any) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item);
      }}
    />
  );
};

export const EmptyStateLoader = ({ title }: { title: string }) => {
  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>{title}</EmptyStateBody>
    </EmptyState>
  );
};

const FetchFilesLoader = ({ title }: { title: string }) => {
  return <SpinContainer title={title} />;
};
