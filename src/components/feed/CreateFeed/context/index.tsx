import React, { createContext, useContext, useReducer } from "react";
import { MainRouterContext } from "../../../../routes";
import { createFeedReducer, getInitialState } from "../reducer/feedReducer";
import {
  pipelineReducer,
  getInitialPipelineState,
} from "../reducer/pipelineReducer";
import { CreateFeedState } from "../types/feed";

const CreateFeedContext = createContext<{
  state: CreateFeedState;
  dispatch: React.Dispatch<any>;
}>({
  state: getInitialState(),
  dispatch: () => null,
});

const PipelineContext = createContext<{
  state: any;
  dispatch: any;
}>({
  state: getInitialPipelineState(),
  dispatch: () => null,
});

interface CreateFeedProviderProps {
  children: React.ReactNode;
}

const CreateFeedProvider: React.FC<CreateFeedProviderProps> = ({
  children,
}: CreateFeedProviderProps) => {
  const { state: routerState } = useContext(MainRouterContext);
  const initialState = getInitialState(routerState);
  const [state, dispatch] = useReducer(createFeedReducer, initialState);
  return (
    <CreateFeedContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateFeedContext.Provider>
  );
};

const PipelineProvider = ({ children }: CreateFeedProviderProps) => {
  const initialpipelineState = getInitialPipelineState();
  const [state, dispatch] = useReducer(pipelineReducer, initialpipelineState);
  return (
    <PipelineContext.Provider value={{ state, dispatch }}>
      {children}
    </PipelineContext.Provider>
  );
};

export {
  CreateFeedContext,
  CreateFeedProvider,
  PipelineProvider,
  PipelineContext,
};
