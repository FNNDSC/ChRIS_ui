import { PacsSeriesState, PacsStudyState } from "../../../store/pacs/types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";
import StudyCard from "./StudyCard.tsx";
import { Collapse, CollapseProps, Space, Typography } from "antd";
import React from "react";
import * as E from "fp-ts/Either";

type PacsStudiesViewProps = {
  studies: PacsStudyState[];
  onRetrieve: (query: PACSqueryCore) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({
  studies,
  onRetrieve,
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
                : !!series.find((series) => !isSeriesPulled(series))
            }
            isLoading={
              series.length === 0
                ? false
                : !!series.find((series) => series.inCube === "loading")
            }
            onExpand={() =>
              onRetrieve({
                patientID: info.PatientID,
                studyInstanceUID: info.StudyInstanceUID,
              })
            }
          ></StudyCard>
        ),
        children: <p>here are the series!</p>,
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
  return (
    <Space size="small" direction="vertical">
      <Collapse
        items={items}
        defaultActiveKey={
          studies.length === 1 ? [studies[0].info.StudyInstanceUID] : []
        }
      />
      <Typography>
        {numPatients === 1 ? "1 patient, " : `${numPatients} patients, `}
        {studies.length === 1 ? "1 study" : `${studies.length} studies`} found.
      </Typography>
    </Space>
  );
};

function isSeriesPulled(series: PacsSeriesState): boolean {
  switch (series.inCube) {
    case null:
      return false;
    case "loading":
      return false;
    default:
      E.isRight(series.inCube);
  }
}

export type { PacsStudiesViewProps };
export default PacsStudiesView;
