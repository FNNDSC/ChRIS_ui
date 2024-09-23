import {
  PacsSeriesState,
  PacsStudyState,
  SERIES_BUSY_STATES,
} from "../../../store/pacs/types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";
import StudyCard from "./StudyCard.tsx";
import { Collapse, CollapseProps, Space, Typography } from "antd";
import React from "react";
import * as E from "fp-ts/Either";
import SeriesList from "./SeriesList.tsx";

type PacsStudiesViewProps = {
  studies: PacsStudyState[];
  onRetrieve: (query: PACSqueryCore) => void;
  onStudyExpand?: (StudyInstanceUID: string) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({
  studies,
  onRetrieve,
  onStudyExpand,
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
                : !series.find((series) => !isSeriesPulled(series))
            }
            isLoading={
              series.length === 0
                ? false
                : !!series.find((series) =>
                    SERIES_BUSY_STATES.includes(series.pullState),
                  )
            }
            onExpand={() =>
              onRetrieve({
                patientID: info.PatientID,
                studyInstanceUID: info.StudyInstanceUID,
              })
            }
          ></StudyCard>
        ),
        children: <SeriesList states={series} />,
      };
    });
  }, studies);
  const numPatients = React.useMemo(() => {
    return studies
      .map((study) => study.info.PatientID)
      .reduce(
        (acc: string[], cur) => (acc.includes(cur) ? acc : acc.concat(cur)),
        [],
      ).length;
  }, [studies]);
  const onChange = React.useMemo(
    () => (studyUids: string[]) => {
      if (!onStudyExpand) {
        return;
      }
      for (const StudyInstanceUID of studyUids) {
        onStudyExpand(StudyInstanceUID);
      }
    },
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
      />
      <Typography>
        {numPatients === 1 ? "1 patient, " : `${numPatients} patients, `}
        {studies.length === 1 ? "1 study" : `${studies.length} studies`} found.
      </Typography>
    </Space>
  );
};

function isSeriesPulled(series: PacsSeriesState): boolean {
  if (series.inCube === null) {
    return false;
  }
  return E.isRight(series.inCube);
}

export type { PacsStudiesViewProps };
export default PacsStudiesView;
