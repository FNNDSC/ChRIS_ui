import React, { createContext, useReducer } from "react";
import { addNodeReducer } from "../reducer";
import { AddNodeState } from "../types";

export function getInitialNodeState(): AddNodeState {
  return {
    stepIdReached: 1,
    nodes: [],
    pluginMeta: undefined,
    selectedPluginFromMeta: undefined,
    requiredInput: {},
    dropdownInput: {},
    selectedComputeEnv: "",
    editorValue: "",
    loading: false,
    errors: undefined,
    isOpen: false,
    pluginMetas: [],
    componentList: [],
    showPreviousRun: false,
  };
}

const AddNodeContext = createContext<{
  state: AddNodeState;
  dispatch: React.Dispatch<any>;
}>({
  state: getInitialNodeState(),
  dispatch: () => null,
});

const AddNodeProvider = ({ children }: { children: React.ReactNode }) => {
  const initialState = getInitialNodeState();
  const [state, dispatch] = useReducer(addNodeReducer, initialState);
  return (
    <AddNodeContext.Provider value={{ state, dispatch }}>
      {children}
    </AddNodeContext.Provider>
  );
};

export { AddNodeContext, AddNodeProvider };
