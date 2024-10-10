import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";
import SeriesMap from "../../api/lonk/seriesMap.ts";
import { PACSqueryCore } from "../../api/pfdcm";

type StudyKey = {
  pacs_name: string;
  StudyInstanceUID: string;
};

type SeriesKey = {
  pacs_name: string;
  SeriesInstanceUID: string;
};

/**
 * Indicates DICOM series has not yet been registered by CUBE.
 */
class SeriesNotRegisteredError extends Error {
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
enum SeriesPullState {
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
enum RequestState {
  NOT_REQUESTED,
  REQUESTING,
  REQUESTED,
}

/**
 * A {@link PACSqueryCore} for a specified PACS.
 */
type SpecificDicomQuery = {
  service: string;
  query: PACSqueryCore;
};

/**
 * The state of a request for a {@link SpecificDicomQuery}.
 */
type PacsPullRequestState = {
  state: RequestState;
  error?: Error;
};

/**
 * The state of requests to PFDCM to pull DICOM study/series.
 */
type PullRequestStates = Map<SpecificDicomQuery, PacsPullRequestState>;

/**
 * The state of a DICOM series retrieval.
 */
type SeriesReceiveState = {
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

const DEFAULT_RECEIVE_STATE: SeriesReceiveState = {
  subscribed: false,
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
type PacsSeriesState = Pick<SeriesReceiveState, "receivedCount"> & {
  errors: ReadonlyArray<string>;
  info: Series;
  inCube: PACSSeries | null;
  pullState: SeriesPullState;
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

export {
  SeriesPullState,
  RequestState,
  DEFAULT_RECEIVE_STATE,
  SeriesNotRegisteredError,
};
export type {
  StudyKey,
  SeriesKey,
  IPacsState,
  ReceiveState,
  SeriesReceiveState,
  PacsSeriesState,
  PacsStudyState,
  PacsPreferences,
  SpecificDicomQuery,
  PacsPullRequestState,
  PullRequestStates,
};
