import { createSlice } from "@reduxjs/toolkit";
import { IPacsState } from "./types.ts";

function initialState(): IPacsState {
  return {
    studies: [],
  };
}

const pacsSlice = createSlice({
  name: "pacs",
  initialState,
  reducers: {},
});

export default pacsSlice.reducer;
