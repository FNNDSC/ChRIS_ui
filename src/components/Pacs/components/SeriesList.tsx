import { List } from "antd";
import type React from "react";
import type { PacsSeriesState } from "../types.ts";
import SeriesRow from "./SeriesRow.tsx";

type SeriesListProps = {
  states: PacsSeriesState[];
  showUid?: boolean;
  onRetrieve?: (state: PacsSeriesState) => void;
};

const SeriesList: React.FC<SeriesListProps> = ({
  states,
  showUid,
  onRetrieve,
}) => (
  <List
    dataSource={states}
    renderItem={(s) => (
      <List.Item>
        <SeriesRow
          showUid={showUid}
          onRetrieve={() => onRetrieve?.(s)}
          {...s}
        />
      </List.Item>
    )}
    rowKey={(state) => state.info.SeriesInstanceUID}
    size="small"
  />
);

export default SeriesList;
