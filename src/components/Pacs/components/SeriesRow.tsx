import { type PacsSeriesState, SeriesPullState } from "../types.ts";
import React from "react";
import { isSeriesLoading } from "./helpers.ts";
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
  Progress,
  Tooltip,
  Typography,
  type MenuProps,
  message,
  theme,
} from "antd";
import styles from "./SeriesList.module.css";
import ModalityBadges from "./ModalityBadges.tsx";
import {
  ImportOutlined,
  WarningFilled,
  FolderOutlined,
} from "@ant-design/icons";
import { CodeBranchIcon } from "../../Icons";
import { useNavigate } from "react-router-dom";
import { createFeed } from "../../../store/cart/downloadSaga.ts";
import { useTheme } from "../../DarkTheme/useTheme";

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

  // Function to format birth date - reused for both library path and feed name
  const formatBirthDate = (birthDate: Date) => {
    if (!birthDate) return "";
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Function to sanitize patient name by replacing ^ with _
  const sanitizePatientName = (name: string) => {
    return name.replace(/\^/g, "_");
  };

  // Generate the path for both library navigation and feed creation
  const getFormattedPath = () => {
    if (!info.PatientBirthDate) return "";
    const formattedBirth = formatBirthDate(info.PatientBirthDate);
    const sanitizedName = sanitizePatientName(info.PatientName);
    return `SERVICES/PACS/${info.RetrieveAETitle}/${info.PatientID}-${sanitizedName}-${formattedBirth}`;
  };

  const showModal = () => {
    if (info.PatientBirthDate) {
      const formattedBirth = formatBirthDate(info.PatientBirthDate);
      const sanitizedName = sanitizePatientName(info.PatientName);
      setFeedName(`${info.PatientID}-${sanitizedName}-${formattedBirth}`);
    } else {
      const sanitizedName = sanitizePatientName(info.PatientName);
      setFeedName(`${info.PatientID}-${sanitizedName}`);
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    if (!isCreatingFeed) {
      setIsModalOpen(false);
      setFeedName("");
    }
  };

  const [messageApi, contextHolder] = message.useMessage();

  const handleCreateFeed = async () => {
    if (!feedName.trim()) {
      messageApi.error("Feed name cannot be empty");
      return;
    }

    setIsCreatingFeed(true);
    try {
      const path = getFormattedPath();
      await createFeed([path], feedName);
      messageApi.success(`Feed "${feedName}" created successfully!`);
      setIsModalOpen(false);
      setFeedName("");
    } catch (error) {
      messageApi.error("Failed to create feed");
    } finally {
      setIsCreatingFeed(false);
    }
  };

  const contextMenuItems: MenuProps["items"] = [
    {
      key: "library",
      label: "Go to Library",
      icon: <FolderOutlined />,
      onClick: () => {
        const path = getFormattedPath();
        navigate(`/library/${path}`);
      },
    },
    {
      key: "feed",
      label: "Create Feed",
      icon: <CodeBranchIcon />,
      onClick: showModal,
    },
  ];

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
        onOk={handleCreateFeed}
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
          onPressEnter={handleCreateFeed}
          autoFocus
        />
      </Modal>

      <Dropdown menu={{ items: contextMenuItems }} trigger={["contextMenu"]}>
        <Card
          styles={{ body: { padding: 10 } }}
          className={`${styles.seriesRow} ${Grid.useBreakpoint().xl && styles.xl}`}
          bordered={false}
          hoverable
          onClick={() =>
            console.log("Series card clicked:", info.SeriesInstanceUID)
          }
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
