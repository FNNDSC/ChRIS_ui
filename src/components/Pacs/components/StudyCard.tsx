import { Study } from "../../../api/pfdcm/models.ts";
import React from "react";
import { Row, Col } from "antd";
import StudyDetails from "./StudyDetails.tsx";
import StudyButtons from "./StudyButtons.tsx";

type StudyCardProps = {
  study: Study;
  isPulled?: boolean;
  isLoading?: boolean;
  onExpand: () => void;
  dateFormat?: string;
  ohifUrl?: string;
};

const StudyCard: React.FC<StudyCardProps> = ({
  study,
  isPulled,
  isLoading,
  dateFormat = "yyyy MMM d",
  ohifUrl = import.meta.env.VITE_OHIF_URL,
}) => (
  <Row>
    <Col xs={21} sm={22} md={23}>
      <StudyDetails study={study} dateFormat={dateFormat} />
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

export default StudyCard;
