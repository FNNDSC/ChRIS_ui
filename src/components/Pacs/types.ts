import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";
import SeriesMap from "../../api/lonk/seriesMap.ts";

type StudyKey = {
  pacs_name: string;
  StudyInstanceUID: string;
};

type SeriesKey = {
  pacs_name: string;
  SeriesInstanceUID: string;
};

/**
 * The states which a DICOM series can be in.
 */
enum SeriesPullState {
  /**
   * Unknown whether series is available in CUBE.
   */
  NOT_CHECKED,
  /**
   * Currently checking for availability in CUBE.
   */
  CHECKING,
  /**
   * Ready to be pulled.
   */
  READY,
  /**
   * Being pulled by oxidicom.
   */
  PULLING,
  /**
   * Done being received by oxidicom, but may or not yet ready in CUBE.
   */
  WAITING_OR_COMPLETE,
}

/**
 * The state of a DICOM series retrieval.
 */
type SeriesReceiveState = {
  /**
   * Whether this series has been requested by PFDCM.
   */
  requested: boolean;
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

const DEFAULT_RECEIVE_STATE: SeriesReceiveState = {
  requested: false,
  done: false,
  receivedCount: 0,
  errors: [],
};

Object.freeze(DEFAULT_RECEIVE_STATE);

/**
 * The state of DICOM series reception.
 */
type ReceiveState = SeriesMap<SeriesReceiveState>;

/**
 * The combined state of a DICOM series in PFDCM, CUBE, and LONK.
 */
type PacsSeriesState = Pick<SeriesReceiveState, "receivedCount" | "errors"> & {
  info: Series;
  inCube: PACSSeries | null;
};

/**
 * The state of a DICOM study.
 */
type PacsStudyState = {
  info: Study;
  series: PacsSeriesState[];
};

/**
 * PACS user interface preferences.
 */
type PacsPreferences = {
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
interface IPacsState {
  preferences: PacsPreferences;
  studies: PacsStudyState[] | null;
}

export { SeriesPullState, DEFAULT_RECEIVE_STATE };
export type {
  StudyKey,
  SeriesKey,
  IPacsState,
  ReceiveState,
  SeriesReceiveState,
  PacsSeriesState,
  PacsStudyState,
  PacsPreferences,
};
