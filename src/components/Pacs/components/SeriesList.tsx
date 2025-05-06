import { List } from "antd";
import type { PacsSeriesState } from "../types.ts";
import type React from "react";
import SeriesRow from "./SeriesRow.tsx";
import { SeriesSelectionProvider } from "./SeriesSelectionContext";
import BulkActionBar from "./BulkActionBar";

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
  <SeriesSelectionProvider>
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
    <BulkActionBar />
  </SeriesSelectionProvider>
);

export default SeriesList;
