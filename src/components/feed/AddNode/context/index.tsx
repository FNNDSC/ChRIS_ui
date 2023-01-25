import React, { createContext, useReducer } from "react";
import { AddNodeState } from "../types";
import { addNodeReducer } from "../reducer";

function getInitialState() {
  return {
    stepIdReached: 1,
    nodes: [],
    data: {},
    requiredInput: {},
    dropdownInput: {},
    selectedComputeEnv: "",
    editorValue: "",
    loading: false,
    errors: {},
    autoFill: false,
  };
}

const AddNodeContext = createContext<{ state: AddNodeState; dispatch: any }>({
  state: getInitialState(),
  dispatch: () => null,
});

interface AddNodeProviderProps {
  children: React.ReactNode;
}

const AddNodeProvider: React.FC<AddNodeProviderProps> = ({
  children,
}: AddNodeProviderProps) => {
  const initialState = getInitialState();
  const [state, dispatch] = useReducer(addNodeReducer, initialState);
  return (
    <AddNodeContext.Provider value={{ state, dispatch }}>
      {children}
    </AddNodeContext.Provider>
  );
};

export { AddNodeProvider, AddNodeContext };
