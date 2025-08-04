import { ImportOutlined, WarningFilled } from "@ant-design/icons";
import {
  Button,
  type ButtonProps,
  Card,
  ConfigProvider,
  Descriptions,
  Dropdown,
  Flex,
  Grid,
  Input,
  Modal,
  message,
  Progress,
  Tooltip,
  Typography,
  theme,
} from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../DarkTheme/useTheme";
import { getBackgroundRowColor } from "../../NewLibrary/utils/longpress.tsx";
import { type PacsSeriesState, SeriesPullState } from "../types.ts";
import { isSeriesLoading } from "./helpers.ts";
import ModalityBadges from "./ModalityBadges.tsx";
import { generateFeedName } from "./pacsUtils";
import {
  type ContextMenuHandlers,
  createSeriesFeed,
  getSeriesContextMenuItems,
} from "./SeriesContextMenu";
import styles from "./SeriesList.module.css";
import { useSeriesSelection } from "./SeriesSelectionContext";

type SeriesRowProps = PacsSeriesState & {
  showUid?: boolean;
  onRetrieve?: () => void;
};

const SeriesRow: React.FC<SeriesRowProps> = ({
  info,
  errors,
  pullState,
  inCube,
  receivedCount,
  showUid,
  onRetrieve,
}) => {
  console.info(
    "SeriesRow: start: seriesUid:",
    info.SeriesInstanceUID,
    "pullState:",
    pullState,
    "receivedCount:",
    receivedCount,
  );
  const isLoading = React.useMemo(
    () => isSeriesLoading({ pullState, inCube }),
    [pullState, inCube],
  );

  const tooltipTitle = React.useMemo(() => {
    if (errors.length > 0) {
      return <>Error: {errors[0]}</>;
    }
    if (pullState === SeriesPullState.NOT_CHECKED) {
      return <>Not ready.</>;
    }
    if (pullState === SeriesPullState.CHECKING) {
      return <>Checking availability&hellip;</>;
    }
    if (pullState === SeriesPullState.READY) {
      return (
        <>
          Pull "{info.SeriesDescription}" into <em>ChRIS</em>.
        </>
      );
    }
    if (pullState === SeriesPullState.PULLING) {
      return <>Receiving&hellip;</>;
    }
    if (inCube === null) {
      return <>Waiting...</>;
    }
    return (
      <>
        This series is available in <em>ChRIS</em>.
      </>
    );
  }, [errors, info, pullState, inCube]);

  const buttonColor = React.useMemo((): ButtonProps["color"] => {
    if (errors.length > 0) {
      return "danger";
    }
    if (pullState === SeriesPullState.READY) {
      return "primary";
    }
    return "default";
  }, [errors, pullState]);

  const percentDone = React.useMemo(() => {
    if (inCube) {
      return 100;
    }
    if (pullState === SeriesPullState.WAITING_OR_COMPLETE) {
      return 99;
    }
    return (
      (99 * receivedCount) /
      (info.NumberOfSeriesRelatedInstances || Number.POSITIVE_INFINITY)
    );
  }, [inCube, pullState, receivedCount, info.NumberOfSeriesRelatedInstances]);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [feedName, setFeedName] = React.useState("");
  const [isCreatingFeed, setIsCreatingFeed] = React.useState(false);
  const { isDarkTheme } = useTheme();
  const [messageApi, contextHolder] = message.useMessage();
  const { isSelected, toggleSelection, getSelectedSeriesData, selectedSeries } =
    useSeriesSelection();
  const seriesId = info.SeriesInstanceUID;
  const selected = isSelected(seriesId);
  const [isRightClicked, setIsRightClicked] = React.useState(false);
  const hasMultipleSelected = selectedSeries.length > 1;

  const showModal = () => {
    if (!hasMultipleSelected) {
      setFeedName(
        generateFeedName({ info, errors, pullState, inCube, receivedCount }),
      );
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

  const handleFeedCreation = async () => {
    if (!feedName.trim()) {
      messageApi.error("Feed name cannot be empty");
      return false;
    }
    setIsCreatingFeed(true);
    try {
      const seriesToProcess =
        selected && hasMultipleSelected ? getSelectedSeriesData() : [];

      const success = await createSeriesFeed(
        seriesToProcess,
        feedName,
        contextMenuHandlers,
      );

      if (success) {
        setIsModalOpen(false);
        setFeedName("");
        return true;
      }
      return false;
    } catch (error) {
      messageApi.error("Failed to create feed");
      return false;
    } finally {
      setIsCreatingFeed(false);
    }
  };

  const contextMenuItems = getSeriesContextMenuItems(
    { info, errors, pullState, inCube, receivedCount },
    selected,
    selectedSeries.length,
    contextMenuHandlers,
    navigate,
  );

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {contextHolder}
      </ConfigProvider>
      <Modal
        title="Create Feed"
        open={isModalOpen}
        onOk={handleFeedCreation}
        onCancel={handleCancel}
        confirmLoading={isCreatingFeed}
        okButtonProps={{ disabled: !feedName.trim() || isCreatingFeed }}
        cancelButtonProps={{ disabled: isCreatingFeed }}
      >
        <Typography.Paragraph>
          Enter a name for your new feed:
        </Typography.Paragraph>
        <Input
          value={feedName}
          onChange={(e) => setFeedName(e.target.value)}
          placeholder="Feed name"
          disabled={isCreatingFeed}
          onPressEnter={handleFeedCreation}
          autoFocus
        />
      </Modal>

      <Dropdown
        menu={{ items: contextMenuItems }}
        trigger={["contextMenu"]}
        onOpenChange={(visible) => {
          // Only set highlighting when menu is opened (not when closed)
          if (visible) {
            setIsRightClicked(true);
          } else {
            setIsRightClicked(false);
          }
        }}
      >
        <Card
          styles={{
            body: {
              padding: 10,
              backgroundColor:
                selected || isRightClicked
                  ? getBackgroundRowColor(true, isDarkTheme)
                  : undefined,
            },
          }}
          className={`${styles.seriesRow} ${Grid.useBreakpoint().xl && styles.xl}`}
          hoverable
          bordered={true}
          onClick={(e) => {
            e.stopPropagation();
            if (inCube) {
              toggleSelection(seriesId, {
                info,
                errors,
                pullState,
                inCube,
                receivedCount,
              });
            } else {
              message.info("Please retrieve the series first");
            }
          }}
        >
          <Flex
            wrap
            vertical={false}
            align="center"
            justify="space-between"
            gap={0}
          >
            <div className={styles.modality}>
              <ModalityBadges modalities={info.Modality} />
            </div>
            <div className={styles.description}>
              <Typography.Text ellipsis={true}>
                {info.SeriesDescription.trim()}
              </Typography.Text>
            </div>
            <div className={styles.fileCount}>
              <Typography.Text className={styles.fileCount}>
                {info.NumberOfSeriesRelatedInstances === 1
                  ? "1 file"
                  : `${info.NumberOfSeriesRelatedInstances === null ? "?" : info.NumberOfSeriesRelatedInstances} files`}
              </Typography.Text>
            </div>
            <div className={styles.progress}>
              <Progress
                type="line"
                format={(n) => `${Math.round(n ?? 0)}%`}
                percent={percentDone}
                status={
                  errors.length > 0
                    ? "exception"
                    : inCube
                      ? "success"
                      : "normal"
                }
              />
            </div>
            <div className={styles.pullButton}>
              <Tooltip placement="left" title={tooltipTitle}>
                <Button
                  loading={isLoading}
                  disabled={pullState !== SeriesPullState.READY}
                  color={buttonColor}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    if (onRetrieve) onRetrieve();
                  }}
                >
                  {/* TODO Button width is different if isLoading */}
                  {errors.length > 1 ? (
                    <WarningFilled />
                  ) : isLoading ? (
                    <></>
                  ) : (
                    <ImportOutlined />
                  )}
                </Button>
              </Tooltip>
            </div>
            {showUid && (
              <Descriptions className={styles.seriesInstanceUid}>
                <Descriptions.Item label="SeriesInstanceUID">
                  {info.SeriesInstanceUID}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Flex>
        </Card>
      </Dropdown>
    </>
  );
};

export type { SeriesRowProps };
export default SeriesRow;
