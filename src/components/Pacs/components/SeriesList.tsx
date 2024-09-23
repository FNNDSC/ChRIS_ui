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
import { PacsSeriesState, SeriesPullState } from "../../../store/pacs/types.ts";
import { useAppSelector } from "../../../store/hooks.ts";
import ModalityBadges from "./ModalityBadges.tsx";
import { ImportOutlined } from "@ant-design/icons";
import styles from "./SeriesList.module.css";

type SeriesTableProps = {
  states: PacsSeriesState[];
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
}) => (
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
          inCube === null ? (
            <>Pull series "{info.SeriesDescription}"</>
          ) : (
            <>
              Series "{info.SeriesDescription}" is already in <em>ChRIS</em>
            </>
          )
        }
      >
        <Button
          loading={
            pullState === SeriesPullState.PULLING ||
            pullState === SeriesPullState.WAITING
          }
          disabled={pullState === SeriesPullState.NOT_READY || inCube !== null}
        >
          <ImportOutlined />
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

const SeriesList: React.FC<SeriesTableProps> = ({ states }) => {
  const showUid = useAppSelector((state) => state.pacs.preferences.showUid);
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
