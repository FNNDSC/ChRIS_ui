import { PacsStudyState, SeriesKey, SeriesPullState } from "./types.ts";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";
import { UseQueryResult } from "@tanstack/react-query";
import { PACSSeries } from "@fnndsc/chrisapi";

type PACSSeriesQueryResult = UseQueryResult<PACSSeries | null, Error>;

type SeriesQueryZip = {
  search: SeriesKey;
  result: PACSSeriesQueryResult;
};

/**
 * Join the responses from PFDCM and CUBE into one object.
 */
function joinStates(
  pfdcm: ReadonlyArray<StudyAndSeries>,
  cubeSeriesQuery: ReadonlyArray<SeriesQueryZip>,
): PacsStudyState[] {
  const cubeSeriesMap: Map<string, PACSSeriesQueryResult> =
    cubeSeriesQuery.reduce(
      (map, s) => map.set(s.search.SeriesInstanceUID, s.result),
      new Map(),
    );
  return pfdcm.map(({ study, series }) => {
    return {
      info: study,
      series: series.map((info) => {
        const cubeQueryResult = cubeSeriesMap.get(info.SeriesInstanceUID);
        return {
          info,
          receivedCount: 0,
          error:
            cubeQueryResult && cubeQueryResult.error
              ? [cubeQueryResult.error.message]
              : [],
          pullState: pullStateOf(cubeQueryResult),
          inCube: cubeQueryResult?.data || null,
        };
      }),
    };
  });
}

function pullStateOf(result?: PACSSeriesQueryResult): SeriesPullState {
  if (!result) {
    return SeriesPullState.NOT_CHECKED;
  }
  if (result.isLoading) {
    return SeriesPullState.CHECKING;
  }
  if (result.data === null) {
    return SeriesPullState.READY;
  }
  return SeriesPullState.WAITING_OR_COMPLETE;
}

export type { SeriesQueryZip };
export default joinStates;
