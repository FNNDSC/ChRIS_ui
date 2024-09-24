import { Study } from "../../../api/pfdcm/models.ts";
import React from "react";
import { Row, Col } from "antd";
import StudyDetails from "./StudyDetails.tsx";
import StudyButtons from "./StudyButtons.tsx";
import { PacsPreferences } from "../types.ts";
import { DEFAULT_PREFERENCES } from "../defaultPreferences.ts";

type StudyCardProps = {
  study: Study;
  isPulled?: boolean;
  isLoading?: boolean;
  onRetrieve?: () => void;
  ohifUrl?: string;
  preferences?: PacsPreferences;
};

const StudyCard: React.FC<StudyCardProps> = ({
  study,
  isPulled,
  isLoading,
  ohifUrl = import.meta.env.VITE_OHIF_URL,
  preferences: { dateFormat, showUid } = DEFAULT_PREFERENCES,
  onRetrieve,
}) => {
  return (
    <Row>
      <Col xs={21} sm={22} md={23}>
        <StudyDetails study={study} dateFormat={dateFormat} showUid={showUid} />
      </Col>
      <Col xs={3} sm={2} md={1}>
        <StudyButtons
          isPulled={isPulled}
          isLoading={isLoading}
          ohifUrl={
            ohifUrl &&
            `${ohifUrl}viewer?StudyInstanceUIDs=${study.StudyInstanceUID}`
          }
          onRetrieve={onRetrieve}
        ></StudyButtons>
      </Col>
    </Row>
  );
};

export default StudyCard;
