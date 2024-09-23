import { IPacsState, PacsStudyState, SeriesPullState } from "./types.ts";
import { StudyAndSeries } from "../../../api/pfdcm/models.ts";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { createContext } from "react";
//
// function initialState(): IPacsState {
//   return {
//     studies: null,
//     preferences: {
//       showUid: false,
//       dateFormat: "yyyy MMM d",
//     },
//   };
// }
//
// const pacsContext = createContext(initialState());
//
// const context = createSlice({
//   name: "pacs",
//   initialState,
//   reducers: {
//     setLoading(state) {
//       state.studies = "loading";
//     },
//     setStudies(
//       state,
//       action: PayloadAction<E.Either<Error, ReadonlyArray<StudyAndSeries>>>,
//     ) {
//       state.studies = pipe(
//         action.payload,
//         E.map((studies) => studies.map(newStudyState)),
//       );
//     },
//   },
// });
//
// function newStudyState({ study, series }: StudyAndSeries): PacsStudyState {
//   return {
//     info: study,
//     series: series.map((info) => {
//       return {
//         info,
//         receivedCount: 0,
//         error: [],
//         pullState: SeriesPullState.READY,
//         inCube: null,
//       };
//     }),
//   };
// }
//
// export { context };
// export default context.reducer;
