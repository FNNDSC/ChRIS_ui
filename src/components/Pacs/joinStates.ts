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

function pullStateOf(
  state: SeriesReceiveState,
  result?: PACSSeriesQueryResult,
): SeriesPullState {
  if (!result) {
    return SeriesPullState.NOT_CHECKED;
  }
  if (result.isLoading) {
    return SeriesPullState.CHECKING;
  }
  if (result.data === null) {
    return state.requested ? SeriesPullState.PULLING : SeriesPullState.READY;
  }
  return SeriesPullState.WAITING_OR_COMPLETE;
}

export type { SeriesQueryZip };
export default joinStates;
