import React, { useState } from "react";
import { Route } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import { RouterContext, RouterProvider } from "./containers/Routing/RouterContext";

import { LogIn } from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import Query from "./pages/DataLibrary";
import SignUp from "./pages/SignUp/SignUp";
import WorkflowsPage from "./pages/WorkflowsPage";

export const [init, MainRouterContext] = RouterContext({
  state: {
    variable: 'init'
  }
});

export const MainRouter: React.FC = () => {
  const [route, setRoute] = useState<string>()
  const [state, setState] = useState(init)

  const actions = {
    openNew: (args: string) => {
      setRoute("/signup")
      setState({
        variable: args
      })
    }
  }

  return (
    <RouterProvider {...{actions, state, route, setRoute}} context={MainRouterContext}>
      <PrivateRoute exact path="/" component={Dashboard} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/pacs" component={Query} />
      <PrivateRoute path="/workflows" component={WorkflowsPage} />
      <Route component={NotFound} />
    </RouterProvider>    
  );
}

export default MainRouter;
