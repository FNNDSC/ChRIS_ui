import React, { useState } from "react";
import { Route } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import { RouterContext, RouterProvider } from "./containers/Routing/RouterContext";

import { LogIn } from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import Library from "./pages/DataLibrary/Library";
import SignUp from "./pages/SignUp/SignUp";
import WorkflowsPage from "./pages/WorkflowsPage";

import { DataItem } from "./pages/DataLibrary/DataTypes";

export const [State, MainRouterContext] = RouterContext({
  state: {},
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createFeedWithData: (d: DataItem[]) => { /**/ }
  }
});

export const MainRouter: React.FC = () => {
  const [state, setState] = useState(State)
  const [route, setRoute] = useState<string>()

  const actions = {
    createFeedWithData: (selectData: DataItem[]) => {
      setState({ selectData })
      setRoute("/feeds")
    }
  }

  return (
    <RouterProvider {...{actions, state, route, setRoute}} context={MainRouterContext}>
      <PrivateRoute exact path="/" component={Dashboard} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/library" component={Library} />
      <PrivateRoute path="/workflows" component={WorkflowsPage} />
      <Route component={NotFound} />
    </RouterProvider>    
  );
}

export default MainRouter;
