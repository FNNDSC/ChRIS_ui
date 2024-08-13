// cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DownloadTypes,
  ICartState,
  SelectionPayload,
  OperationPayload,
  UploadPayload,
} from "./types";

const initialState: ICartState = {
  selectedPaths: [],
  openCart: false,
  folderDownloadStatus: {},
  fileDownloadStatus: {},
  folderUploadStatus: {},
  fileUploadStatus: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    startUpload(state, _action: PayloadAction<UploadPayload>) {
      state.openCart = true;
    },
    setSelectedPaths(state, action: PayloadAction<SelectionPayload>) {
      state.selectedPaths.push(action.payload);
    },
    setBulkSelectedPaths(state, action: PayloadAction<SelectionPayload[]>) {
      state.selectedPaths.push(...action.payload);
    },
    clearSelectedPaths(state, action: PayloadAction<string>) {
      state.selectedPaths = state.selectedPaths.filter(
        (pathObj) => pathObj.path !== action.payload,
      );
    },
    clearDownloadStatus(
      state,
      action: PayloadAction<{ path: string; type: string }>,
    ) {
      const { path, type } = action.payload;
      if (type === "folder") {
        delete state.folderDownloadStatus[path];
      } else if (type === "file") {
        delete state.fileDownloadStatus[path];
      }
    },
    setToggleCart(state) {
      state.openCart = !state.openCart;
    },
    setFileDownloadStatus(
      state,
      action: PayloadAction<{
        id: number;
        step: DownloadTypes;
        fileName: string;
        error?: string;
      }>,
    ) {
      const { id, step, fileName, error } = action.payload;
      state.fileDownloadStatus[id] = { step, fileName, error };
    },
    setFolderDownloadStatus(
      state,
      action: PayloadAction<{
        id: number;
        step: DownloadTypes;
        fileName?: string;
        error?: string;
        feed?: any;
      }>,
    ) {
      const { id, step, fileName, error, feed } = action.payload;
      state.folderDownloadStatus[id] = { step, error, fileName, feed };
    },
    setFileUploadStatus(
      state,
      action: PayloadAction<{
        step: string;
        fileName: string;
        progress: number;
        controller: AbortController | null;
        path: string;
        type: string;
      }>,
    ) {
      const { step, fileName, progress, controller, path, type } =
        action.payload;
      state.fileUploadStatus[fileName] = {
        currentStep: step,
        progress,
        controller,
        path,
        type,
      };
    },
    setFolderUploadStatus(
      state,
      action: PayloadAction<{
        step: string;
        fileName: string;
        totalCount: number;
        currentCount: number;
        controller: AbortController | null;
        path: string;
        type: string;
      }>,
    ) {
      const {
        step,
        fileName,
        totalCount,
        currentCount,
        controller,
        path,
        type,
      } = action.payload;
      state.folderUploadStatus[fileName] = {
        currentStep: step,
        done: currentCount,
        total: totalCount,
        controller,
        path,
        type,
      };
    },
    removeSelectedPayload(state, action: PayloadAction<SelectionPayload>) {
      state.selectedPaths = state.selectedPaths.filter(
        (currentPayload) => currentPayload.path !== action.payload.path,
      );
    },
    clearUploadState(
      state,
      action: PayloadAction<{ id: string; type: string }>,
    ) {
      const { id, type } = action.payload;
      if (type === "folder") {
        delete state.folderUploadStatus[id];
      } else {
        delete state.fileUploadStatus[id];
      }
    },
    clearCart(state) {
      state.selectedPaths = [];
    },
    cancelUpload(
      _state,
      _action: PayloadAction<{ type: string; id: string }>,
    ) {},
    clearFeedCreationStatus(_state) {},
    startDownload(_state, _action: PayloadAction<OperationPayload>) {},
    startAnonymize(_state, _action: PayloadAction<OperationPayload>) {},
  },
});

export const {
  startUpload,
  setSelectedPaths,
  setBulkSelectedPaths,
  clearSelectedPaths,
  clearDownloadStatus,
  setToggleCart,
  setFileDownloadStatus,
  setFolderDownloadStatus,
  setFileUploadStatus,
  setFolderUploadStatus,
  removeSelectedPayload,
  clearUploadState,
  clearCart,
  cancelUpload,
  clearFeedCreationStatus,
  startDownload,
  startAnonymize,
} = cartSlice.actions;

export default cartSlice.reducer;
