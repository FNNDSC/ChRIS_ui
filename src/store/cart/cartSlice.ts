// cartSlice.ts
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  ICartState,
  OperationPayload,
  SelectionPayload,
  UploadPayload,
} from "./types";
import { DownloadTypes } from "./types";

const initialState: ICartState = {
  currentLayout: "list",
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
    switchLibraryLayout(state, action: PayloadAction<"grid" | "list">) {
      state.currentLayout = action.payload;
    },
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
    clearAllPaths(state) {
      state.selectedPaths = [];
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
      if (step === DownloadTypes.finished) {
        // When a file download finishes, remove its associated path
        state.selectedPaths = state.selectedPaths.filter(
          (selected) => selected.path !== fileName,
        );
      }
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
      if (step === DownloadTypes.finished && fileName) {
        // When a folder download finishes, remove its associated path (if available)
        state.selectedPaths = state.selectedPaths.filter(
          (selected) => selected.path !== fileName,
        );
      }
    },
    setFileUploadStatus(
      state,
      action: PayloadAction<{
        step: string;
        fileName: string;
        progress: number;
        loaded: number;
        total: number;
        controller: AbortController | null;
        path: string;
        type: string;
      }>,
    ) {
      const {
        step,
        fileName,
        progress,
        loaded,
        total,
        controller,
        path,
        type,
      } = action.payload;
      state.fileUploadStatus[fileName] = {
        currentStep: step,
        progress,
        loaded,
        total,
        controller,
        path,
        type,
      };
      if (step === "Upload Complete") {
        // When file upload is complete, remove its path from selectedPaths
        state.selectedPaths = state.selectedPaths.filter(
          (selected) => selected.path !== path,
        );
      }
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
      if (step === "Upload Complete") {
        // When folder upload is complete, remove its path from selectedPaths
        state.selectedPaths = state.selectedPaths.filter(
          (selected) => selected.path !== path,
        );
      }
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
      // Filter out finished operations from upload statuses
      state.folderUploadStatus = Object.fromEntries(
        Object.entries(state.folderUploadStatus).filter(
          ([_, value]) => value.currentStep !== "Upload Complete",
        ),
      );
      state.fileUploadStatus = Object.fromEntries(
        Object.entries(state.fileUploadStatus).filter(
          ([_, value]) => value.currentStep !== "Upload Complete",
        ),
      );

      // Filter out finished operations from download statuses
      state.folderDownloadStatus = Object.fromEntries(
        Object.entries(state.folderDownloadStatus).filter(
          ([_, value]) => value.step !== DownloadTypes.finished,
        ),
      );
      state.fileDownloadStatus = Object.fromEntries(
        Object.entries(state.fileDownloadStatus).filter(
          ([_, value]) => value.step !== DownloadTypes.finished,
        ),
      );
    },

    clearCartOnLogout(state) {
      // If the user log's out, wipe the state clean so the the notification cart does not persist between multiple user logins

      state.selectedPaths = [];
      state.fileDownloadStatus = {};
      state.folderUploadStatus = {};
      state.fileDownloadStatus = {};
      state.folderDownloadStatus = {};
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
  switchLibraryLayout,
  startUpload,
  setSelectedPaths,
  setBulkSelectedPaths,
  clearSelectedPaths,
  clearAllPaths,
  clearDownloadStatus,
  setToggleCart,
  setFileDownloadStatus,
  setFolderDownloadStatus,
  setFileUploadStatus,
  setFolderUploadStatus,
  removeSelectedPayload,
  clearUploadState,
  clearCart,
  clearCartOnLogout,
  cancelUpload,
  clearFeedCreationStatus,
  startDownload,
  startAnonymize,
} = cartSlice.actions;

export default cartSlice.reducer;
