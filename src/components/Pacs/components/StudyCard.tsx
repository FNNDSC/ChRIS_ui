import { Study } from "../../../api/pfdcm/models.ts";
import React from "react";
import { Row, Col } from "antd";
import StudyDetails from "./StudyDetails.tsx";
import StudyButtons from "./StudyButtons.tsx";
import { PacsPreferences } from "../types.ts";
import { DEFAULT_PREFERENCES } from "../defaultPreferences.ts";

type StudyCardProps = {
  study: Study;
  showUid?: boolean;
  isPulled?: boolean;
  isLoading?: boolean;
  onExpand: () => void;
  ohifUrl?: string;
  preferences?: PacsPreferences;
};

const StudyCard: React.FC<StudyCardProps> = ({
  study,
  isPulled,
  isLoading,
  ohifUrl = import.meta.env.VITE_OHIF_URL,
  preferences: { dateFormat, showUid } = DEFAULT_PREFERENCES,
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
        ></StudyButtons>
      </Col>
    </Row>
  );
};

export default StudyCard;
