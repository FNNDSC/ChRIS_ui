import { Collapse, type CollapseProps, Space, Typography } from "antd";
import React, { useEffect } from "react";
import type { PACSqueryCore } from "../../../api/pfdcm";
import type { PacsPreferences, PacsStudyState } from "../types.ts";
import BulkActionBar from "./BulkActionBar";
import { isSeriesLoading } from "./helpers.ts";
import SeriesList from "./SeriesList.tsx";
import { SeriesSelectionProvider } from "./SeriesSelectionContext";
import StudyCard from "./StudyCard.tsx";

type Props = {
  preferences: PacsPreferences;
  studies: PacsStudyState[];
  onRetrieve: (query: PACSqueryCore) => void;
  /**
   * List of StudyInstanceUIDs which should be expanded.
   */
  expandedStudyUids?: string[];
  onStudyExpand?: (StudyInstanceUIDs: ReadonlyArray<string>) => void;
};

const PacsStudiesView: React.FC<Props> = ({
  studies,
  onRetrieve,
  expandedStudyUids,
  onStudyExpand,
  preferences,
}) => {
  useEffect(() => {
    // Automatically expand first study if there is only one study
    if (studies.length === 1 && expandedStudyUids?.length === 0) {
      onStudyExpand?.([studies[0].info.StudyInstanceUID]);
    }
  }, [studies]);

  const items: CollapseProps["items"] = React.useMemo(() => {
    return studies.map(({ info, series }) => {
      return {
        key: info.StudyInstanceUID,
        label: (
          <StudyCard
            study={info}
            isPulled={
              series.length === 0
                ? true
                : series.every(
                    ({ inCube, info }) =>
                      inCube !== null ||
                      info.NumberOfSeriesRelatedInstances === 0 ||
                      info.NumberOfSeriesRelatedInstances === null,
                  )
            }
            isLoading={
              series.length === 0 ? false : !!series.find(isSeriesLoading)
            }
            onRetrieve={() => {
              if (expandedStudyUids && onStudyExpand) {
                onStudyExpand(expandedStudyUids.concat(info.StudyInstanceUID));
              }
              onRetrieve({
                patientID: info.PatientID,
                studyInstanceUID: info.StudyInstanceUID,
              });
            }}
          />
        ),
        children: (
          <SeriesList
            states={series}
            showUid={preferences.showUid}
            onRetrieve={({ info }) =>
              onRetrieve({
                patientID: info.PatientID,
                seriesInstanceUID: info.SeriesInstanceUID,
              })
            }
          />
        ),
      };
    });
  }, [studies, onRetrieve, preferences.showUid]);

  const numPatients = React.useMemo(() => {
    return studies
      .map((study) => study.info.PatientID)
      .reduce(
        (acc: string[], cur) => (acc.includes(cur) ? acc : acc.concat(cur)),
        [],
      ).length;
  }, [studies]);

  const onChange = React.useCallback(
    (studyUids: string[]) => onStudyExpand?.(studyUids),
    [onStudyExpand],
  );

  return (
    <SeriesSelectionProvider>
      <Space size="small" direction="vertical" style={{ width: "100%" }}>
        <Collapse
          items={items}
          defaultActiveKey={
            studies.length === 1 ? [studies[0].info.StudyInstanceUID] : []
          }
          onChange={onChange}
          activeKey={expandedStudyUids}
        />
        <Typography>
          {numPatients === 1 ? "1 patient, " : `${numPatients} patients, `}
          {studies.length === 1 ? "1 study" : `${studies.length} studies`}{" "}
          found.
        </Typography>
        <BulkActionBar />
      </Space>
    </SeriesSelectionProvider>
  );
};

export type { Props };
export default PacsStudiesView;
