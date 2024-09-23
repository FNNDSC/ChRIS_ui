import { PacsStudyState, SeriesPullState } from "./types.ts";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";

/**
 * Join the responses from PFDCM and CUBE into one object.
 */
function joinStates(pfdcm: ReadonlyArray<StudyAndSeries>): PacsStudyState[] {
  return pfdcm.map(({ study, series }) => {
    return {
      info: study,
      series: series.map((info) => {
        return {
          info,
          receivedCount: 0,
          error: [],
          pullState: SeriesPullState.NOT_READY,
          inCube: null,
        };
      }),
    };
  });
}

export default joinStates;
