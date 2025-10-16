import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IExplorerState } from "./types";

const initialState: IExplorerState = {
  selectedFile: undefined,
};

const explorerSlice = createSlice({
  name: "explorer",
  initialState,
  reducers: {
    setSelectedFile(
      state,
      action: PayloadAction<FileBrowserFolderFile | undefined>,
    ) {
      state.selectedFile = action.payload;
    },
    clearSelectedFile(state) {
      state.selectedFile = undefined;
    },
  },
});

export const { setSelectedFile, clearSelectedFile } = explorerSlice.actions;
export default explorerSlice.reducer;
