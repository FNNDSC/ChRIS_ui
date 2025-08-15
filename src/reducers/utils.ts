import type { PACSqueryCore } from "../api/pfdcm";
import { parsePypxDicomDate } from "../api/pfdcm/client";
import type {
  PypxTag,
  Series,
  Study,
  StudyAndSeries,
} from "../api/pfdcm/models";

export const updateSearchParams = (key: string, value: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value); // Add or update the parameter
  history.pushState(null, "", url);
};

export const deleteSearchParams = (key: string) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(key); // Add or update the parameter
  history.pushState(null, "", url);
};

export const getSearchParams = (key: string) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(key) || "";
};

export const simplifyPypxStudyData = (data: {
  [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }>;
}): Study => {
  const NumberOfStudyRelatedSeries =
    "value" in data.NumberOfStudyRelatedSeries &&
    data.NumberOfStudyRelatedSeries.value !== 0
      ? parseInt(data.NumberOfStudyRelatedSeries.value)
      : NaN;

  return {
    SpecificCharacterSet: getValue(data, "SpecificCharacterSet"),
    StudyDate: parsePypxDicomDate(data.StudyDate),
    AccessionNumber: getValue(data, "AccessionNumber"),
    RetrieveAETitle: getValue(data, "RetrieveAETitle"),
    ModalitiesInStudy: getValue(data, "ModalitiesInStudy"),
    StudyDescription: getValue(data, "StudyDescription"),
    PatientName: getValue(data, "PatientName"),
    PatientID: getValue(data, "PatientID"),
    PatientBirthDate: parsePypxDicomDate(data.PatientBirthDate),
    PatientSex: getValue(data, "PatientSex"),
    PatientAge: getValue(data, "PatientAge"),
    ProtocolName: getValue(data, "ProtocolName"),
    AcquisitionProtocolName: getValue(data, "AcquisitionProtocolName"),
    AcquisitionProtocolDescription: getValue(
      data,
      "AcquisitionProtocolDescription",
    ),
    StudyInstanceUID: getValue(data, "StudyInstanceUID"),
    NumberOfStudyRelatedSeries,

    PerformedStationAETitle: getValue(data, "PerformedStationAETitle"),
  };
};

export const simplifyPypxSeriesData = (data: {
  [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }>;
}): Series => {
  const NumberOfSeriesRelatedInstances =
    "value" in data.NumberOfSeriesRelatedInstances &&
    data.NumberOfSeriesRelatedInstances.value !== 0
      ? parseInt(data.NumberOfSeriesRelatedInstances.value)
      : NaN;

  return {
    SpecificCharacterSet: getValue(data, "SpecificCharacterSet"),
    StudyDate: parsePypxDicomDate(data.StudyDate),
    SeriesDate: parsePypxDicomDate(data.SeriesDate),
    AccessionNumber: getValue(data, "AccessionNumber"),
    RetrieveAETitle: getValue(data, "RetrieveAETitle"),
    Modality: getValue(data, "Modality"),
    StudyDescription: getValue(data, "StudyDescription"),
    SeriesDescription: getValue(data, "SeriesDescription"),
    PatientName: getValue(data, "PatientName"),
    PatientID: getValue(data, "PatientID"),
    PatientBirthDate: parsePypxDicomDate(data.PatientBirthDate),
    PatientSex: getValue(data, "PatientSex"),
    PatientAge: getValue(data, "PatientAge"),
    ProtocolName: getValue(data, "ProtocolName"),
    AcquisitionProtocolName: getValue(data, "AcquisitionProtocolName"),
    AcquisitionProtocolDescription: getValue(
      data,
      "AcquisitionProtocolDescription",
    ),
    StudyInstanceUID: getValue(data, "StudyInstanceUID"),
    SeriesInstanceUID: getValue(data, "SeriesInstanceUID"),
    NumberOfSeriesRelatedInstances,

    PerformedStationAETitle: getValue(data, "PerformedStationAETitle"),
  };
};

const getValue = (
  data: { [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }> },
  name: string,
): string => {
  if (!(name in data)) {
    return "";
  }
  if ("value" in data[name]) {
    return "" + data[name].value;
  }
  return "";
};

export const isFromPacs = (pacs_name: string) => {
  return (s: StudyAndSeries) => s.study.RetrieveAETitle === pacs_name;
};

export const studyUIDToStudyMapKey = (
  pacsName: string,
  studyInstanceUID: string,
) => `${pacsName}-${studyInstanceUID}`;

export const seriesUIDToSeriesMapKey = (
  pacsName: string,
  seriesInstanceUID: string,
) => `${pacsName}-${seriesInstanceUID}`;

export const queryToSeriesReceiveStateKey = (
  service: string,
  query: PACSqueryCore,
) => {
  return `${service}-${query.seriesInstanceUID}`;
};
