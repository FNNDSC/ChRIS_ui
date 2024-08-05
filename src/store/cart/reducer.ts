import type { Reducer } from "redux";
import { produce } from "immer";
import { type ICartState, ICartActionTypes } from "./types";

const initialState: ICartState = {
  selectedPaths: [],
  openCart: false,
  folderDownloadStatus: {},
  fileDownloadStatus: {},
  folderUploadStatus: {},
  fileUploadStatus: {},
};

const reducer: Reducer<ICartState> = produce(
  (draft: ICartState, action: typeof ICartActionTypes) => {
    switch (action.type) {
      case ICartActionTypes.START_UPLOAD: {
        draft.openCart = true;
        break;
      }

      case ICartActionTypes.SET_SELECTED_PATHS: {
        draft.selectedPaths.push(action.payload);
        break;
      }

      case ICartActionTypes.SET_BULK_SELECTED_PATHS: {
        draft.selectedPaths.push(...action.payload);
        break;
      }

      case ICartActionTypes.CLEAR_SELECTED_PATHS: {
        draft.selectedPaths = draft.selectedPaths.filter(
          (pathObj) => pathObj.path !== action.payload,
        );
        break;
      }

      case ICartActionTypes.CLEAR_DOWNLOAD_STATUS: {
        const { path, type } = action.payload;
        type === "folder" && delete draft.folderDownloadStatus[path];
        type === "file" && delete draft.fileDownloadStatus[path];
        break;
      }

      case ICartActionTypes.SET_TOGGLE_CART: {
        draft.openCart = !draft.openCart;
        break;
      }

      case ICartActionTypes.SET_FILE_DOWNLOAD_STATUS: {
        const { id, step, error, fileName } = action.payload;
        draft.fileDownloadStatus[id] = { step, fileName, error };
        break;
      }

      case ICartActionTypes.SET_FOLDER_DOWNLOAD_STATUS: {
        const { id, step, error, fileName, feed } = action.payload;

        draft.folderDownloadStatus[id] = { step, fileName, error, feed };
        break;
      }

      case ICartActionTypes.SET_FILE_UPLOAD_STATUS: {
        const { step, fileName, progress, controller, path, type } =
          action.payload;
        draft.fileUploadStatus[fileName] = {
          currentStep: step,
          progress,
          controller,
          path,
          type,
        };
        break;
      }

      case ICartActionTypes.SET_FOLDER_UPLOAD_STATUS: {
        const {
          step,
          fileName,
          totalCount,
          currentCount,
          controller,
          path,
          type,
        } = action.payload;
        draft.folderUploadStatus[fileName] = {
          currentStep: step,
          done: currentCount,
          total: totalCount,
          controller,
          path,
          type,
        };
        break;
      }

      case ICartActionTypes.REMOVE_SELECTED_PAYLOAD: {
        draft.selectedPaths = draft.selectedPaths.filter((currentPayload) => {
          return currentPayload.path !== action.payload.path;
        });
        break;
      }

      case ICartActionTypes.CLEAR_CART: {
        draft.selectedPaths = [];
        break;
      }

      default: {
        return draft;
      }
    }
  },
  initialState,
);

export { reducer as cartReducer };
