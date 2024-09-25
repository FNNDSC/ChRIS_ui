import { PacsPreferences, PacsStudyState } from "../types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";
import StudyCard from "./StudyCard.tsx";
import { Collapse, CollapseProps, Space, Typography } from "antd";
import React from "react";
import SeriesList from "./SeriesList.tsx";
import { isSeriesLoading } from "./helpers.ts";

type PacsStudiesViewProps = {
  preferences: PacsPreferences;
  studies: PacsStudyState[];
  onRetrieve: (query: PACSqueryCore) => void;
  /**
   * List of StudyInstanceUIDs which should be expanded.
   */
  expandedStudyUids?: string[];
  onStudyExpand?: (StudyInstanceUIDs: ReadonlyArray<string>) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({
  studies,
  onRetrieve,
  expandedStudyUids,
  onStudyExpand,
  preferences,
}) => {
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
                : !series.find(({ inCube }) => inCube === null)
            }
            isLoading={
              series.length === 0 ? false : !!series.find(isSeriesLoading)
            }
            onRetrieve={() =>
              onRetrieve({
                patientID: info.PatientID,
                studyInstanceUID: info.StudyInstanceUID,
              })
            }
          ></StudyCard>
        ),
        children: <SeriesList states={series} showUid={preferences.showUid} />,
      };
    });
  }, [studies]);
  const numPatients = React.useMemo(() => {
    return studies
      .map((study) => study.info.PatientID)
      .reduce(
        (acc: string[], cur) => (acc.includes(cur) ? acc : acc.concat(cur)),
        [],
      ).length;
  }, [studies]);
  const onChange = React.useCallback(
    (studyUids: string[]) => onStudyExpand && onStudyExpand(studyUids),
    [onStudyExpand],
  );
  return (
    <Space size="small" direction="vertical">
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
        {studies.length === 1 ? "1 study" : `${studies.length} studies`} found.
      </Typography>
    </Space>
  );
};

export type { PacsStudiesViewProps };
export default PacsStudiesView;
