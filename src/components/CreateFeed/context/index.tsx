import React, { createContext, useContext, useReducer } from "react";
import { MainRouterContext } from "../../../App";
import { createFeedReducer, getInitialState } from "../reducer/feedReducer";
import { CreateFeedState } from "../types/feed";

const CreateFeedContext = createContext<{
  state: CreateFeedState;
  dispatch: React.Dispatch<any>;
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

  const [state, dispatch] = useReducer(createFeedReducer, initialState);

  return (
    <CreateFeedContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateFeedContext.Provider>
  );
};

export { CreateFeedContext, CreateFeedProvider };
