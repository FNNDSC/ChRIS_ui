import type { PACSqueryCore } from "../../api/pfdcm";
import type { Series, Study } from "../../api/pfdcm/models.ts";
import type { PACSSeries } from "../../api/types.ts";

export type StudyKey = {
  pacs_name: string;
  StudyInstanceUID: string;
};

export type SeriesKey = {
  pacs_name: string;
  SeriesInstanceUID: string;
};

export enum SearchMode {
  MRN = "mrn",
  AccessNo = "accno",
}

export const QUERY_PROMPT = {
  [SearchMode.MRN]: "PatientID",
  [SearchMode.AccessNo]: "AccessionNumber",
};

/**
 * Indicates DICOM series has not yet been registered by CUBE.
 */
export class SeriesNotRegisteredError extends Error {
  public readonly pacs_name: string;
  public readonly SeriesInstanceUID: string;
  public constructor(pacs_name: string, SeriesInstanceUID: string) {
    super();
    this.pacs_name = pacs_name;
    this.SeriesInstanceUID = SeriesInstanceUID;
  }
}

/**
 * The states which a DICOM series can be in.
 */
export enum SeriesPullState {
  /**
   * Unknown whether series is available in CUBE.
   */
  NOT_CHECKED = "not checked",
  /**
   * Currently checking for availability in CUBE.
   */
  CHECKING = "checking",
  /**
   * Ready to be pulled.
   */
  READY = "ready",
  /**
   * Being pulled by oxidicom.
   */
  PULLING = "pulling",
  /**
   * Done being received by oxidicom, but may or not yet ready in CUBE.
   */
  WAITING_OR_COMPLETE = "waiting or complete",
}

/**
 * The states a request can be in.
 */
export enum RequestState {
  NOT_REQUESTED = 0,
  REQUESTING = 1,
  REQUESTED = 2,
}

/**
 * A {@link PACSqueryCore} for a specified PACS.
 */
export type SpecificDicomQuery = {
  service: string;
  query: PACSqueryCore;
};

/**
 * The state of a request for a {@link SpecificDicomQuery}.
 */
export type PacsPullRequestState = {
  state: RequestState;
  error?: Error;
};

/**
 * The state of requests to PFDCM to pull DICOM study/series.
 */
export type PacsPullRequestStateMap = { [key: string]: PacsPullRequestState };

/**
 * The state of a DICOM series retrieval.
 */
export type SeriesReceiveState = {
  /**
   * Whether this series has been subscribed to via LONK.
   */
  subscribed: boolean;
  /**
   * Whether this series was reported as "done" by LONK.
   */
  done: boolean;
  /**
   * Last progress count reported by LONK.
   */
  receivedCount: number;
  /**
   * Error messages reported by LONK, in ascending order of recency.
   */
  errors: string[];
};

export const DEFAULT_RECEIVE_STATE: SeriesReceiveState = {
  subscribed: false,
  done: false,
  receivedCount: 0,
  errors: [],
};

Object.freeze(DEFAULT_RECEIVE_STATE);

/**
 * The state of DICOM series reception.
 */
export type SeriesReceiveStateMap = { [key: string]: SeriesReceiveState };

/**
 * The combined state of a DICOM series in PFDCM, CUBE, and LONK.
 */
export type PacsSeriesState = SeriesReceiveState & {
  errors: ReadonlyArray<string>;
  info: Series;
  inCube: { data: PACSSeries } | null;
  pullState: SeriesPullState;
};

/**
 * The state of a DICOM study.
 */
export type PacsStudyState = {
  info: Study;
  series: PacsSeriesState[];
};

export type PacsSeriesCSV = {
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
  NumberOfStudyRelatedSeries: number;
  PerformedStationAETitle: string;

  SeriesDate: Date | null;
  Modality: string;
  SeriesDescription: string;
  SeriesInstanceUID: string;
  NumberOfSeriesRelatedInstances: number | null;
};

export const PacsStudyCSVKeys = [
  "SpecificCharacterSet",
  "StudyDate",
  "AccessionNumber",
  "RetrieveAETitle",
  "ModalitiesInStudy",
  "StudyDescription",
  "PatientName",
  "PatientID",
  "PatientBirthDate",
  "PatientSex",
  "PatientAge",
  "ProtocolName",
  "AcquisitionProtocolName",
  "AcquisitionProtocolDescription",
  "StudyInstanceUID",
  "NumberOfStudyRelatedSeries",
  "PerformedStationAETitle",
];

export const PacsSeriesCSVKeys = [
  "SeriesDate",
  "Modality",
  "SeriesDescription",
  "SeriesInstanceUID",
  "NumberOfSeriesRelatedInstances",
];

/**
 * PACS user interface preferences.
 */
export type PacsPreferences = {
  /**
   * Whether to display StudyInstanceUID and SeriesInstanceUID.
   */
  showUid: boolean;

  /**
   * A `date-fns` compatible date format.
   */
  dateFormat: string;
};

/**
 * PACS user interface entire state.
 */
export interface PacsState {
  preferences: PacsPreferences;
  studies: PacsStudyState[] | null;
}
