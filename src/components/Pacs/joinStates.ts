import {
  DEFAULT_RECEIVE_STATE,
  PacsStudyState,
  ReceiveState,
  SeriesKey,
  SeriesPullState,
  SeriesReceiveState,
} from "./types.ts";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";
import { UseQueryResult } from "@tanstack/react-query";
import { PACSSeries } from "@fnndsc/chrisapi";

type PACSSeriesQueryResult = UseQueryResult<PACSSeries | null, Error>;

type SeriesQueryZip = {
  search: SeriesKey;
  result: PACSSeriesQueryResult;
};

/**
 * Fragments of the state of a DICOM series exists remotely in three places:
 * PFDCM, CUBE, and LONK.
 *
 * Join the states from those places into one mega-object.
 */
function joinStates(
  pfdcm: ReadonlyArray<StudyAndSeries>,
  cubeSeriesQuery: ReadonlyArray<SeriesQueryZip>,
  receiveState: ReceiveState,
): PacsStudyState[] {
  const cubeSeriesMap = new Map(
    cubeSeriesQuery.map(({ search, result }) => [
      search.SeriesInstanceUID,
      result,
    ]),
  );
  return pfdcm.map(({ study, series }) => {
    return {
      info: study,
      series: series.map((info) => {
        const cubeQueryResult = cubeSeriesMap.get(info.SeriesInstanceUID);
        const cubeErrors =
          cubeQueryResult && cubeQueryResult.error
            ? [cubeQueryResult.error.message]
            : [];
        const state =
          receiveState.get(info.RetrieveAETitle, info.SeriesInstanceUID) ||
          DEFAULT_RECEIVE_STATE;
        return {
          info,
          receivedCount: state.receivedCount,
          errors: state.errors.concat(cubeErrors),
          pullState: pullStateOf(state, cubeQueryResult),
          inCube: cubeQueryResult?.data || null,
        };
      }),
    };
  });
}

/**
 * State coalescence.
 *
 * It is assumed that ChRIS has the following behavior for each DICOM series:
 *
 * 1. ChRIS_ui subscribes to a series' notifications via LONK
 * 2. ChRIS_ui checks CUBE whether a series exists in CUBE
 * 3. When both subscription and existence check is complete,
 *    and the series does not exist in CUBE, ChRIS_ui is ready
 *    to pull the DICOM series.
 * 4. During the reception of a DICOM series, `status.done === false`
 * 5. After the reception of a DICOM series, ChRIS enters a "waiting"
 *    state while the task to register the DICOM series is enqueued
 *    or running.
 * 6. The DICOM series will appear in CUBE after being registered.
 */
function pullStateOf(
  state: SeriesReceiveState,
  result?: { isLoading: boolean; data: any },
): SeriesPullState {
  if (!result) {
    // request to check CUBE whether series exists has not been initiated
    return SeriesPullState.NOT_CHECKED;
  }
  if (!state.subscribed || result.isLoading) {
    // either not subscribed yet, or request to check CUBE whether series
    // exists is pending
    return SeriesPullState.CHECKING;
  }
  if (result.data === null) {
    // checked, series DOES NOT exist in CUBE
    if (state.done) {
      // finished receiving by oxidicom, waiting for CUBE to register
      return SeriesPullState.WAITING_OR_COMPLETE;
    }
    // either pulling or ready to pull
    return state.requested ? SeriesPullState.PULLING : SeriesPullState.READY;
  }
  // checked, series DOES exist in CUBE. It is complete.
  return SeriesPullState.WAITING_OR_COMPLETE;
}

export type { SeriesQueryZip };
export { pullStateOf };
export default joinStates;
