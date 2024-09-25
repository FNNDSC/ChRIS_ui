import {
  Button,
  ButtonProps,
  Descriptions,
  Flex,
  Grid,
  List,
  Progress,
  Tooltip,
  Typography,
} from "antd";
import { PacsSeriesState, SeriesPullState } from "../types.ts";
import ModalityBadges from "./ModalityBadges.tsx";
import { ImportOutlined, WarningFilled } from "@ant-design/icons";
import styles from "./SeriesList.module.css";
import React from "react";
import { isSeriesLoading } from "./helpers.ts";

type SeriesTableProps = {
  states: PacsSeriesState[];
  showUid?: boolean;
};

type SeriesRowProps = PacsSeriesState & {
  showUid?: boolean;
};

const SeriesRow: React.FC<SeriesRowProps> = ({
  info,
  errors,
  pullState,
  inCube,
  receivedCount,
  showUid,
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

  return (
    <Flex
      wrap
      vertical={false}
      align="center"
      justify="space-between"
      gap={0}
      className={`${styles.seriesRow} ${Grid.useBreakpoint().xl && styles.xl}`}
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
          percent={
            inCube
              ? 100
              : receivedCount /
                (info.NumberOfSeriesRelatedInstances || Infinity)
          }
        />
      </div>
      <div className={styles.pullButton}>
        <Tooltip placement="left" title={tooltipTitle}>
          <Button
            loading={isLoading}
            disabled={pullState !== SeriesPullState.READY}
            color={buttonColor}
          >
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
  );
};

const SeriesList: React.FC<SeriesTableProps> = ({ states, showUid }) => {
  return (
    <List
      dataSource={states}
      renderItem={(s) => (
        <List.Item>
          <SeriesRow showUid={showUid} {...s} />
        </List.Item>
      )}
      rowKey={(state) => state.info.SeriesInstanceUID}
      size="small"
    />
  );
};

export default SeriesList;
