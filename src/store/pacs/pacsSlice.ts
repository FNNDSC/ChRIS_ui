import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPacsState, PacsStudyState } from "./types.ts";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

function initialState(): IPacsState {
  return {
    studies: null,
  };
}

const pacsSlice = createSlice({
  name: "pacs",
  initialState,
  reducers: {
    setLoading(state) {
      state.studies = "loading";
    },
    setStudies(
      state,
      action: PayloadAction<E.Either<Error, ReadonlyArray<StudyAndSeries>>>,
    ) {
      state.studies = pipe(
        action.payload,
        E.map((studies) => studies.map(newStudyState)),
      );
    },
  },
});

function newStudyState({ study, series }: StudyAndSeries): PacsStudyState {
  return {
    info: study,
    series: series.map((info) => {
      return {
        info,
        receivedCount: 0,
        error: [],
        done: false,
        inCube: null,
      };
    }),
  };
}

export { pacsSlice };
export default pacsSlice.reducer;
