import {
  DEFAULT_RECEIVE_STATE,
  PacsPullRequestState,
  PacsStudyState,
  ReceiveState,
  RequestState,
  SeriesKey,
  SeriesNotRegisteredError,
  SeriesPullState,
  SeriesReceiveState,
} from "./types.ts";
import { Series, StudyAndSeries } from "../../api/pfdcm/models.ts";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PACSSeries } from "@fnndsc/chrisapi";

type UseQueryResultLike = Partial<
  Pick<UseQueryResult, "isError" | "isPending" | "error">
>;

/**
 * Fragments of the state of a DICOM series exists remotely in three places:
 * PFDCM, CUBE, and LONK.
 *
 * Merge the states from those places into one mega-object.
 *
 * @param pfdcm PACS query response from PFDCM
 * @param pullRequests state of the PACS pull requests to PFDCM
 * @param cubeQueryMap mapping of `SeriesInstanceUID` to queries for respective
 *                     {@link PACSSeries} in CUBE (hint: call
 *                     {@link createCubeSeriesQueryUidMap})
 * @param receiveState state of DICOM receive operation conveyed via LONK
 */
function mergeStates(
  pfdcm: ReadonlyArray<StudyAndSeries>,
  pullRequests: ReadonlyArray<PacsPullRequestState>,
  cubeQueryMap: Map<string, UseQueryResult<PACSSeries | null, Error>>,
  receiveState: ReceiveState,
): PacsStudyState[] {
  return pfdcm.map(({ study, series }) => {
    return {
      info: study,
      series: series.map((info) => {
        const cubeQueryResult = cubeQueryMap.get(info.SeriesInstanceUID);
        const cubeError = cubeQueryResult?.error;
        const cubeErrors = cubeError ? [cubeError.message] : [];
        const state =
          receiveState.get(info.RetrieveAETitle, info.SeriesInstanceUID) ??
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
 * Reshape queries and the parameters used for each query to a map
 * where the key is `SeriesInstanceUID`.
 *
 * Also removes entries where the query is pending or the error is
 * {@link SeriesNotRegisteredError}.
 *
 * @param params {@link useQuery} parameters
 * @param queries the React "hook" returned by {@link useQuery}
 */
function createCubeSeriesQueryUidMap<T extends UseQueryResultLike>(
  params: ReadonlyArray<SeriesKey>,
  queries: ReadonlyArray<T>,
): Map<string, T> {
  const entries = zipArray(params, queries)
    .filter(([_, query]) => !query.isPending && !isNotRegisteredError(query))
    .map(([p, q]): [string, T] => [p.SeriesInstanceUID, q]);
  return new Map(entries);
}

function zipArray<A, B>(
  a: ReadonlyArray<A>,
  b: ReadonlyArray<B>,
): ReadonlyArray<[A, B]> {
  if (a.length !== b.length) {
    throw new Error(`Array lengths are different (${a.length} != ${b.length})`);
  }
  return a.map((item, i) => [item, b[i]]);
}

function isNotRegisteredError(q: UseQueryResultLike): boolean {
  return Boolean(q.isError) && q.error instanceof SeriesNotRegisteredError;
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

export type { UseQueryResultLike };
export { mergeStates, pullStateOf, createCubeSeriesQueryUidMap };
