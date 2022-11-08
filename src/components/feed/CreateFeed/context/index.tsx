import React, { createContext, useContext, useReducer } from "react";
import { MainRouterContext } from "../../../../routes";
import { createFeedReducer, getInitialState } from "../reducer/feedReducer";
import {
  pipelineReducer,
  getInitialPipelineState,
} from "../reducer/pipelineReducer";


const CreateFeedContext = createContext<{
  state: any;
  dispatch: any;
}>({
  state: getInitialState(),
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
  const initialpipelineState = getInitialPipelineState();

  const [state, dispatch] = useCombinedReducer({
    feedState: useReducer(createFeedReducer, initialState),
    pipelineState: useReducer(pipelineReducer, initialpipelineState),
  });

  return (
    <CreateFeedContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateFeedContext.Provider>
  );
};

export { CreateFeedContext, CreateFeedProvider };

const useCombinedReducer = (combinedReducers: any) => {
  const state = Object.keys(combinedReducers).reduce(
    (acc, key) => ({ ...acc, [key]: combinedReducers[key][0] }),
    {}
  );

  // Global Dispatch Function
  const dispatch = (action: any) =>
    Object.keys(combinedReducers)
      .map((key) => combinedReducers[key][1])
      .forEach((fn) => fn(action));

  return [state, dispatch];
};
