import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";

export const myClass = "chris-ui/explorer";

export interface State extends rState {
  selectedFile?: FileBrowserFolderFile;
}

export const defaultState: State = {};

export const init = (): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(_init({ state: defaultState }));
  };
};

export const setSelectedFile = (
  myID: string,
  selectedFile: FileBrowserFolderFile,
): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedFile }));
  };
};

export const clearSelectedFile = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    dispatch(setData(myID, { selectedFile: undefined }));
  };
};
