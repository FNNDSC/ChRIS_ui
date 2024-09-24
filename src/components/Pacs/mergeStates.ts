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
 * Merge the states from those places into one mega-object.
 */
function mergeStates(
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
 * State coalescence for the "PACS Retrieve Workflow" described in the
 * tsdoc for {@link PacsController}.
 */
function pullStateOf(
  state: SeriesReceiveState,
  cubeQueryResult?: { isLoading: boolean; data: any },
): SeriesPullState {
  if (!cubeQueryResult) {
    // request to check CUBE whether series exists has not been initiated
    return SeriesPullState.NOT_CHECKED;
  }
  if (!state.subscribed || cubeQueryResult.isLoading) {
    // either not subscribed yet, or request to check CUBE whether series
    // exists is pending
    return SeriesPullState.CHECKING;
  }
  if (cubeQueryResult.data === null) {
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
export default mergeStates;
