import { format } from "date-fns";
import { Descriptions } from "antd";
import ModalityBadges from "./ModalityBadges.tsx";
import React from "react";
import { Study } from "../../../api/pfdcm/models.ts";

const StudyDetails: React.FC<{
  study: Study;
  dateFormat: string;
  showUid?: boolean;
}> = ({ study, dateFormat, showUid }) => (
  <Descriptions
    title={
      <span>
        Study "{study.StudyDescription}"{" "}
        <span style={{ fontWeight: "initial" }}>
          on {study.StudyDate ? format(study.StudyDate, dateFormat) : "unknown"}{" "}
          {study.AccessionNumber &&
            !study.AccessionNumber.includes("no value provided") && (
              <>(AccessionNumber: {study.AccessionNumber})</>
            )}
        </span>
      </span>
    }
  >
    <Descriptions.Item label="Patient Name">
      {study.PatientName}
    </Descriptions.Item>
    <Descriptions.Item label="Patient Age">
      {formatPypxAge(study.PatientAge)}
    </Descriptions.Item>
    <Descriptions.Item label="Sex">
      {formatPypxSex(study.PatientSex)}
    </Descriptions.Item>
    <Descriptions.Item label="Patient ID (MRN)">
      {study.PatientID}
    </Descriptions.Item>
    <Descriptions.Item label="Station">
      {study.PerformedStationAETitle}
    </Descriptions.Item>
    <Descriptions.Item label="Modalities">
      <ModalityBadges modalities={study.ModalitiesInStudy} />
    </Descriptions.Item>
    {showUid && (
      <Descriptions.Item label="StudyInstanceUID">
        {study.StudyInstanceUID}
      </Descriptions.Item>
    )}
  </Descriptions>
);

function formatPypxAge(age: string) {
  if (age.includes("no value provided")) {
    return "unknown";
  }
  return age;
}

function formatPypxSex(dicomSex: string) {
  if (dicomSex.includes("no value provided")) {
    return "unknown";
  }
  switch (dicomSex.toUpperCase()) {
    case "M":
      return "male";
    case "F":
      return "Female";
    case "O":
      return "Other";
    default:
      return dicomSex;
  }
}

export default StudyDetails;
