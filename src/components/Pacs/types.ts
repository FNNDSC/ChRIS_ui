/**
 * Developer note: do not use {@link ReadonlyArray} because
 * it is not supported as antd props.
 */

import { Series, Study } from "../../api/pfdcm/models.ts";
import { PACSSeries } from "@fnndsc/chrisapi";
import { Either } from "fp-ts/Either";

enum SeriesPullState {
  /**
   * Not ready to be pulled.
   */
  NOT_READY,
  /**
   * Ready to be pulled.
   */
  READY,
  /**
   * Being pulled by oxidicom.
   */
  PULLING,
  /**
   * Done being received by oxidicom, but not yet ready in CUBE.
   */
  WAITING,
}

/**
 * States in which a series is considered "busy".
 */
const SERIES_BUSY_STATES: ReadonlyArray<SeriesPullState> = [
  SeriesPullState.NOT_READY,
  SeriesPullState.PULLING,
  SeriesPullState.WAITING,
];

type PacsSeriesState = {
  info: Series;
  receivedCount: number;
  error: string[];
  pullState: SeriesPullState;
  inCube: Either<Error, PACSSeries> | null;
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

export { SERIES_BUSY_STATES, SeriesPullState };
export type { IPacsState, PacsSeriesState, PacsStudyState, PacsPreferences };
