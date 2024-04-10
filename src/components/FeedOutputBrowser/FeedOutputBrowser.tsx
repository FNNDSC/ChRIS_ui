import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";
import React from "react";
import type { PluginInstance } from "@fnndsc/chrisapi";
import FileBrowser from "./FileBrowser";
import { SpinContainer } from "../Common";
import { useFeedBrowser } from "./useFeedBrowser";

import "./FeedOutputBrowser.css";

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void;
  explore: boolean;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = () => {
  const {
    selected,
    pluginFilesPayload,
    statusTitle,
    handleFileClick,
    filesLoading,
  } = useFeedBrowser();

  return (
    <div className="feed-output-browser">
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
    </div>
  );
};

export default FeedOutputBrowser;

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
