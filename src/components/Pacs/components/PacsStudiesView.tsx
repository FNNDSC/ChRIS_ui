import { PacsStudyState } from "../../../store/pacs/types.ts";
import { PACSqueryCore } from "../../../api/pfdcm";
import StudyCard from "./StudyCard.tsx";
import { List } from "antd";
import React from "react";

type PacsStudiesViewProps = {
  studies: PacsStudyState[];
  onRetrieve: (query: PACSqueryCore) => void;
};

const PacsStudiesView: React.FC<PacsStudiesViewProps> = ({
  studies,
  onRetrieve,
}) => {
  return (
    <List
      dataSource={studies}
      rowKey={(study) => study.info.StudyInstanceUID}
      renderItem={({ info, series }) => (
        <List.Item style={{ width: "100%" }}>
          <StudyCard
            study={info}
            isPulled={React.useMemo(() => {
              for (const s of series) {
                if (s.inCube === null) {
                  return false;
                }
              }
              return true;
            }, [series])}
            isLoading={React.useMemo(() => {
              for (const s of series) {
                if (s.inCube === "loading") {
                  return true;
                }
              }
              return false;
            }, [series])}
            onExpand={React.useMemo(
              () => () =>
                onRetrieve({
                  patientID: info.PatientID,
                  studyInstanceUID: info.StudyInstanceUID,
                }),
              [onRetrieve, info],
            )}
          ></StudyCard>
        </List.Item>
      )}
    />
  );
};

export type { PacsStudiesViewProps };
export default PacsStudiesView;
