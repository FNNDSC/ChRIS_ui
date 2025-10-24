import {
  Button,
  ConfigProvider,
  Flex,
  Input,
  Modal,
  message,
  Typography,
  theme,
} from "antd";
import React from "react";
import { useTheme } from "../../DarkTheme/useTheme";
import { AnalysisIcon } from "../../Icons";
import { generateFeedName } from "./pacsUtils";
import {
  type ContextMenuHandlers,
  createSeriesFeed,
} from "./SeriesContextMenu";
import { useSeriesSelection } from "./SeriesSelectionContext";

const BulkActionBar: React.FC = () => {
  const {
    hasSelection,
    selectedSeries,
    clearSelection,
    getSelectedSeriesData,
  } = useSeriesSelection();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [feedName, setFeedName] = React.useState("");
  const [isCreatingFeed, setIsCreatingFeed] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { isDarkTheme } = useTheme();

  if (!hasSelection) {
    return null;
  }

  const showModal = () => {
    // Don't generate a default name for multiple series
    if (selectedSeries.length > 1) {
      setFeedName("");
    } else if (selectedSeries.length === 1) {
      // For a single series, generate a standard name
      const singleSeries = getSelectedSeriesData()[0];
      setFeedName(generateFeedName(singleSeries));
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    if (!isCreatingFeed) {
      setIsModalOpen(false);
      setFeedName("");
    }
  };

  const contextMenuHandlers: ContextMenuHandlers = {
    showFeedCreationModal: showModal,
    displayMessage: (type, content) => {
      if (type === "success") {
        messageApi.success(content);
      } else {
        messageApi.error(content);
      }
    },
  };

  const handleCreateFeed = async () => {
    if (!feedName.trim()) {
      messageApi.error("Feed name cannot be empty");
      return;
    }

    setIsCreatingFeed(true);
    try {
      const seriesData = getSelectedSeriesData();

      const success = await createSeriesFeed(
        seriesData,
        feedName,
        contextMenuHandlers,
      );

      if (success) {
        setIsModalOpen(false);
        setFeedName("");
        clearSelection();
      }
    } catch (error) {
      messageApi.error("Failed to create feed");
    } finally {
      setIsCreatingFeed(false);
    }
  };

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {contextHolder}
        <Modal
          title="Create Feed from Selected Series"
          open={isModalOpen}
          onOk={handleCreateFeed}
          onCancel={handleCancel}
          confirmLoading={isCreatingFeed}
          okButtonProps={{ disabled: !feedName.trim() || isCreatingFeed }}
          cancelButtonProps={{ disabled: isCreatingFeed }}
        >
          <Typography.Paragraph>
            Enter a name for your new feed ({selectedSeries.length} series
            selected):
          </Typography.Paragraph>
          <Input
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
            placeholder="Feed name"
            disabled={isCreatingFeed}
            onPressEnter={handleCreateFeed}
            autoFocus
          />
        </Modal>

        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: isDarkTheme ? "#141414" : "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <Flex align="center" gap={16}>
            <Typography.Text strong>
              {selectedSeries.length} series selected
            </Typography.Text>
            <Button icon={<AnalysisIcon />} onClick={showModal} type="primary">
              Create Feed
            </Button>
            <Button onClick={clearSelection}>Clear Selection</Button>
          </Flex>
        </div>
      </ConfigProvider>
    </>
  );
};

export default BulkActionBar;
