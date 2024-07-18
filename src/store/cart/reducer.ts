import type { Reducer } from "redux";
import { type ICartState, ICartActionTypes } from "./types";

const initialState: ICartState = {
  selectedPaths: [],
  openCart: false,
  folderDownloadStatus: {},
  fileDownloadStatus: {},
  folderUploadStatus: {},
  fileUploadStatus: {},
};

const reducer: Reducer<ICartState> = (
  state = initialState,
  action: typeof ICartActionTypes,
) => {
  switch (action.type) {
    case ICartActionTypes.START_UPLOAD: {
      return {
        ...state,
        openCart: true,
      };
    }

    case ICartActionTypes.SET_SELECTED_PATHS: {
      return {
        ...state,
        selectedPaths: [...state.selectedPaths, action.payload],
      };
    }

    case ICartActionTypes.SET_BULK_SELECTED_PATHS: {
      return {
        ...state,
        selectedPaths: [...state.selectedPaths, ...action.payload],
      };
    }

    case ICartActionTypes.CLEAR_SELECTED_PATHS: {
      const newSelectedPaths = state.selectedPaths.filter((pathObj) => {
        return pathObj.path !== action.payload;
      });
      return {
        ...state,
        selectedPaths: newSelectedPaths,
      };
    }

    case ICartActionTypes.SET_TOGGLE_CART: {
      return {
        ...state,
        openCart: !state.openCart,
      };
    }

    case ICartActionTypes.SET_FILE_DOWNLOAD_STATUS: {
      const { id, step } = action.payload;
      return {
        ...state,
        fileDownloadStatus: {
          ...state.fileDownloadStatus,
          [id]: step,
        },
      };
    }

    case ICartActionTypes.SET_FOLDER_DOWNLOAD_STATUS: {
      const { id, step } = action.payload;

      return {
        ...state,
        folderDownloadStatus: {
          ...state.folderDownloadStatus,
          [id]: step,
        },
      };
    }

    case ICartActionTypes.SET_FILE_UPLOAD_STATUS: {
      const { step, fileName, progress, controller, path, type } =
        action.payload;

      return {
        ...state,
        fileUploadStatus: {
          ...state.fileUploadStatus,
          [fileName]: {
            currentStep: step,
            progress,
            controller,
            path,
            type,
          },
        },
      };
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
      return {
        ...state,
        folderUploadStatus: {
          ...state.folderUploadStatus,
          [fileName]: {
            currentStep: step,
            done: currentCount,
            total: totalCount,
            controller,
            path,
            type,
          },
        },
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as cartReducer };
