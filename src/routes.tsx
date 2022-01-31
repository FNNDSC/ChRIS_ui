import React, { useState } from "react";
import { Route } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import {
  RouterContext,
  RouterProvider
} from "./containers/Routing/RouterContext";
import { LogIn } from "./containers/LogIn/Login";
import { NotFoundPage as NotFound } from "./containers/NotFound/NotFound";
import Dashboard from "./containers/Dashboard/Dashboard";
import FeedsPage from "./containers/Feeds/Feeds";
import GalleryPage from "./containers/ViewImage/ViewImage";
import VisualizationPage from "./containers/VisualizationPage";
import Library, { Series } from "./containers/DataLibrary/Library";
import SignUp from "./containers/SignUp/SignUp";
import WorkflowsPage from "./containers/WorkflowsPage";
import CatalogPage from "./containers/CatalogPage";
import SliceDropPage from "./containers/VisualizationPage/SliceDropPage";
import MedviewPage from "./containers/VisualizationPage/MedviewPage";
import FetalMri from "./containers/VisualizationPage/FetalMri";
import Collab from "./containers/VisualizationPage/Collab";
import BrainBrowser from "./containers/VisualizationPage/BrainBrowser";

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
  const [state, setState] = useState(State);
  const [route, setRoute] = useState<string>();

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      setRoute("/feeds");
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    }
  };

  return (
    <RouterProvider
      {...{ actions, state, route, setRoute }}
      context={MainRouterContext}
    >
      <PrivateRoute exact path="/" component={Dashboard} />
      <PrivateRoute exact path="/catalog" component={CatalogPage} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/library" component={Library} />
      <PrivateRoute path="/gallery" component={GalleryPage} />
      <PrivateRoute path="/workflows" component={WorkflowsPage} />
      <PrivateRoute path="/visualization" component={VisualizationPage} />
      <PrivateRoute path="/slicedrop" component={SliceDropPage} />
      <PrivateRoute path="/medview" component={MedviewPage} />
      <PrivateRoute path="/fetalmri" component={FetalMri} />
      <PrivateRoute path="/brainbrowser" component={BrainBrowser} />
      <PrivateRoute path="/collab" component={Collab} />
      <Route component={NotFound} />
    </RouterProvider>
  );
};

export default MainRouter;
