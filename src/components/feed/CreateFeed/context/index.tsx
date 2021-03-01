import React, { createContext, useReducer } from "react";
import { initialState, createFeedReducer } from "../reducer";
import { CreateFeedState } from "../types";

const CreateFeedContext = createContext<{
  state: CreateFeedState;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});

interface CreateFeedProviderProps {
  children: React.ReactNode;
}

const CreateFeedProvider: React.FC<CreateFeedProviderProps> = ({
  children,
}: CreateFeedProviderProps) => {
  const [state, dispatch] = useReducer(createFeedReducer, initialState);
  return (
    <CreateFeedContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateFeedContext.Provider>
  );
};

export { CreateFeedContext, CreateFeedProvider };
