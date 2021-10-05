import React, { useState } from "react";
import { Route } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import { RouterContext, RouterProvider } from "./containers/Routing/RouterContext";

import { LogIn } from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import Library, { Series } from "./pages/DataLibrary/Library";
import SignUp from "./pages/SignUp/SignUp";
import WorkflowsPage from "./pages/WorkflowsPage";
import PipelinesPage from "./pages/PipelinesPage/PipelinesPage";
import PipelineView from "./pages/PipelinesPage/components/PipelineView";

interface IState {
  selectData?: Series;
}

interface IActions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({ 
  state: {
    selectData: [] as Series
  } 
});

export const MainRouter: React.FC = () => {
  const [state, setState] = useState(State)
  const [route, setRoute] = useState<string>()

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData })
      setRoute("/feeds")
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    }
  }

  return (
    <RouterProvider {...{ actions, state, route, setRoute }} context={MainRouterContext}>
      <PrivateRoute exact path="/" component={Dashboard} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/library" component={Library} />
      <PrivateRoute exact path="/pipelines" component={PipelinesPage}/>
      <PrivateRoute path="/pipelines/:id" component={PipelineView}/>
      <PrivateRoute path="/workflows" component={WorkflowsPage} />
      <Route component={NotFound} />
    </RouterProvider>
  );
}

export default MainRouter;

