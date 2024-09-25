import {
  DEFAULT_RECEIVE_STATE,
  PacsPullRequestState,
  PacsStudyState,
  ReceiveState,
  RequestState,
  SeriesKey,
  SeriesPullState,
  SeriesReceiveState,
} from "./types.ts";
import { Series, StudyAndSeries } from "../../api/pfdcm/models.ts";
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
  pullRequests: ReadonlyArray<PacsPullRequestState>,
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
        const pullRequestsForSeries = pullRequests.findLast((pr) =>
          isRequestFor(pr, info),
        );
        return {
          info,
          receivedCount: state.receivedCount,
          errors: state.errors.concat(cubeErrors),
          pullState: pullStateOf(
            state,
            pullRequestsForSeries?.state,
            cubeQueryResult,
          ),
          inCube: cubeQueryResult?.data || null,
        };
      }),
    };
  });
}

/**
 * @returns `true` if the query matches the series.
 */
function isRequestFor(
  { query, service }: PacsPullRequestState,
  series: Series,
): boolean {
  if (service !== series.RetrieveAETitle) {
    return false;
  }
  if (query.seriesInstanceUID) {
    return query.seriesInstanceUID === series.SeriesInstanceUID;
  }
  if (query.studyInstanceUID) {
    return query.studyInstanceUID === series.StudyInstanceUID;
  }
  if (query.accessionNumber) {
    return query.accessionNumber === series.AccessionNumber;
  }
  return false;
}

/**
 * State coalescence for the "PACS Retrieve Workflow" described in the
 * tsdoc for {@link PacsController}.
 */
function pullStateOf(
  state: SeriesReceiveState,
  pacsRequest?: RequestState,
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
    if (state.receivedCount > 0) {
      // DICOM series is being received, even though it wasn't requested.
      // It was probably requested in another window, or by another user,
      // or pushed to us without a MOVE-SCU request.
      return SeriesPullState.PULLING;
    }
    if (pacsRequest === undefined) {
      // Series is not requested nor pulled and ready to be pulled.
      return SeriesPullState.READY;
    }
    // Request to retrieve was sent to PFDCM, but no files received yet.
    return SeriesPullState.PULLING;
  }
  // checked, series DOES exist in CUBE. It is complete.
  return SeriesPullState.WAITING_OR_COMPLETE;
}

export type { SeriesQueryZip };
export { pullStateOf };
export default mergeStates;
