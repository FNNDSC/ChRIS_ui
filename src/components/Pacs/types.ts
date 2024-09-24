/**
 * Developer note: do not use {@link ReadonlyArray} because
 * it is not supported as antd props.
 */

import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";

type StudyKey = {
  pacs_name: string;
  StudyInstanceUID: string;
};

type SeriesKey = {
  pacs_name: string;
  SeriesInstanceUID: string;
};

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

type PacsSeriesState = {
  info: Series;
  receivedCount: number;
  error: string[];
  pullState: SeriesPullState;
  inCube: PACSSeries | null;
};

type PacsStudyState = {
  info: Study;
  series: PacsSeriesState[];
};

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

interface IPacsState {
  preferences: PacsPreferences;
  studies: PacsStudyState[] | null;
}

export { SeriesPullState };
export type {
  StudyKey,
  SeriesKey,
  IPacsState,
  PacsSeriesState,
  PacsStudyState,
  PacsPreferences,
};
