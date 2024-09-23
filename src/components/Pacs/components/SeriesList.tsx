import {
  Button,
  Descriptions,
  Flex,
  Grid,
  List,
  Progress,
  Tooltip,
  Typography,
} from "antd";
import {
  PacsSeriesState,
  SERIES_BUSY_STATES,
  SeriesPullState,
} from "../types.ts";
import ModalityBadges from "./ModalityBadges.tsx";
import { ImportOutlined } from "@ant-design/icons";
import styles from "./SeriesList.module.css";
import React from "react";

type SeriesTableProps = {
  states: PacsSeriesState[];
  showUid?: boolean;
};

type SeriesRowProps = PacsSeriesState & {
  showUid?: boolean;
};

const SeriesRow: React.FC<SeriesRowProps> = ({
  info,
  pullState,
  inCube,
  receivedCount,
  showUid,
}) => {
  const isLoading = React.useMemo(
    () => SERIES_BUSY_STATES.includes(pullState),
    [SERIES_BUSY_STATES, pullState],
  );

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
            receivedCount / (info.NumberOfSeriesRelatedInstances || Infinity)
          }
        />
      </div>
      <div className={styles.pullButton}>
        <Tooltip
          placement="left"
          title={
            pullState === SeriesPullState.NOT_READY ? (
              <>Checking availability...</>
            ) : inCube === null ? (
              <>Pull series "{info.SeriesDescription}"</>
            ) : (
              <>
                Series "{info.SeriesDescription}" is already in <em>ChRIS</em>
              </>
            )
          }
        >
          <Button
            loading={isLoading}
            disabled={
              pullState === SeriesPullState.NOT_READY || inCube !== null
            }
          >
            {isLoading || <ImportOutlined />}
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
