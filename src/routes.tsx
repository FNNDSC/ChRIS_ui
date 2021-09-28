import React, { useState } from "react";
import { Route } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import {
  RouterContext,
  RouterProvider,
} from "./containers/Routing/RouterContext";

import { LogIn } from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import GalleryPage from "./pages/ViewImage/ViewImage";
import VisualizationPage from "./pages/VisualizationPage";
import Library, { Series } from "./pages/DataLibrary/Library";
import SignUp from "./pages/SignUp/SignUp";
import WorkflowsPage from "./pages/WorkflowsPage";

interface IState {
  selectData?: Series;
}

interface IActions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({
  state: {
    selectData: [] as Series,
  },
});

export const MainRouter: React.FC = () => {
  const [state, setState] = useState(State);
  const [route, setRoute] = useState<string>();

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      setRoute("/feeds");
    },

    clearFeedData: () => {
<<<<<<< HEAD
      setState({ selectData: [] });
=======
      setState({ selectData: undefined });
>>>>>>> 037934b78a7f0a1ae83a0de0a7a7a803543fc27a
    },
  };

  return (
    <RouterProvider
      {...{ actions, state, route, setRoute }}
      context={MainRouterContext}
    >
      <PrivateRoute exact path="/" component={Dashboard} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/library" component={Library} />
      <PrivateRoute path="/gallery" component={GalleryPage} />
      <PrivateRoute path="/workflows" component={WorkflowsPage} />
      <PrivateRoute path="/visualization" component={VisualizationPage} />
      <Route component={NotFound} />
    </RouterProvider>
  );
};

export default MainRouter;
