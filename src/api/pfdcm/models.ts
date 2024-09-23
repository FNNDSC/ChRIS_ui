import { PACSqueryCore } from "./generated";

type PypxTag = {
  tag: 0 | string;
  value: 0 | string;
  label: string;
};

type Pypx = {
  status: "success" | "error";
  command: string;
  data: ReadonlyArray<{
    [key: string]: PypxTag | ReadonlyArray<{ [key: string]: PypxTag }>;
  }>;
  args: PACSqueryCore;
};

/**
 * PFDCM "find" endpoint response, in its unprocessed and ugly original form.
 *
 * See https://github.com/FNNDSC/pfdcm/blob/3.1.22/pfdcm/controllers/pacsQRcontroller.py#L171-L176
 */
type PypxFind = {
  status: boolean;
  find: {};
  message: string;
  PACSdirective: PACSqueryCore;
  pypx: Pypx;
};

/**
 * DICOM study metadata.
 */
type Study = {
  SpecificCharacterSet: string;
  StudyDate: Date | null;
  AccessionNumber: string;
  RetrieveAETitle: string;
  ModalitiesInStudy: string;
  StudyDescription: string;
  PatientName: string;
  PatientID: string;
  PatientBirthDate: Date | null;
  PatientSex: string;
  PatientAge: string;
  ProtocolName: string;
  AcquisitionProtocolName: string;
  AcquisitionProtocolDescription: string;
  StudyInstanceUID: string;
  NumberOfStudyRelatedSeries: string;
  PerformedStationAETitle: string;
};

/**
 * DICOM series metadata.
 */
type Series = {
  SpecificCharacterSet: string;
  StudyDate: string;
  SeriesDate: string;
  AccessionNumber: string;
  RetrieveAETitle: string;
  Modality: string;
  StudyDescription: string;
  SeriesDescription: string;
  PatientName: string;
  PatientID: string;
  PatientBirthDate: Date | null;
  PatientSex: string;
  PatientAge: string;
  ProtocolName: string;
  AcquisitionProtocolName: string;
  AcquisitionProtocolDescription: string;
  StudyInstanceUID: string;
  SeriesInstanceUID: string;
  NumberOfSeriesRelatedInstances: string;
  PerformedStationAETitle: string;
};

/**
 * PACS query response data.
 */
type StudyAndSeries = {
  study: Study;
  series: ReadonlyArray<Series>;
};

export type { PypxFind, Pypx, PypxTag, Study, Series, StudyAndSeries };
