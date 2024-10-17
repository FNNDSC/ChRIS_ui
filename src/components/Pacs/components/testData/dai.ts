import { Study, Series } from "../../../../api/pfdcm/models";

const DAI_STUDY: Study = {
  SpecificCharacterSet: "ISO_IR 100",
  StudyDate: null,
  AccessionNumber: "123abc",
  RetrieveAETitle: "HOSPITALNAME",
  ModalitiesInStudy: "CR",
  StudyDescription: "Chest X-ray for COVID-19 Screening",
  PatientName: "George Smith",
  PatientID: "DAI000290",
  PatientBirthDate: null,
  PatientSex: "M",
  PatientAge: "71",
  ProtocolName: "no value provided for 0018,1030",
  AcquisitionProtocolName: "no value provided for 0018,9423",
  AcquisitionProtocolDescription: "no value provided for 0018,9424",
  StudyInstanceUID: "1.2.276.0.7230010.3.1.2.8323329.8519.1517874337.873082",
  NumberOfStudyRelatedSeries: 1,
  PerformedStationAETitle: "no value provided for 0040,0241",
};

const DAI_SERIES: Series = {
  SpecificCharacterSet: "ISO_IR 100",
  StudyDate: DAI_STUDY.StudyDate,
  SeriesDate: DAI_STUDY.StudyDate,
  AccessionNumber: "123abc",
  RetrieveAETitle: "HOSPITALNAME",
  Modality: "CR",
  StudyDescription: "Chest X-ray for COVID-19 Screening",
  SeriesDescription: "Series Description: Unknown",
  PatientName: "George Smith",
  PatientID: "DAI000290",
  PatientBirthDate: new Date(1950, 2, 7),
  PatientSex: "M",
  PatientAge: "71",
  ProtocolName: "no value provided for 0018,1030",
  AcquisitionProtocolName: "no value provided for 0018,9423",
  AcquisitionProtocolDescription: "no value provided for 0018,9424",
  StudyInstanceUID: "1.2.276.0.7230010.3.1.2.8323329.8519.1517874337.873082",
  SeriesInstanceUID: "1.2.276.0.7230010.3.1.3.8323329.8519.1517874337.873097",
  NumberOfSeriesRelatedInstances: 1,
  PerformedStationAETitle: "no value provided for 0040,0241",
};

export { DAI_STUDY, DAI_SERIES };
