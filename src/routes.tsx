import React from "react";
import { Route, Switch } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import { LogIn } from "./pages/LogIn/Login";
import { NotFound } from "./pages/NotFound/NotFound";
import { Charts } from "./pages/Charts/Charts";
import ViewerPage from "./pages/Viewer/Viewer";

const Routes: React.FunctionComponent = () => (
  <React.Fragment>
    <Switch>
      <Route exact path="/" component={Dashboard} />
      <Route exact path="/charts" component={Charts} />
      <Route exact path="/ami" component={ViewerPage} />
      <Route exact path="/login" component={LogIn} />
      <PrivateRoute path="/feeds" component={FeedsPage} />{" "}
      <Route component={NotFound} />
    </Switch>
  </React.Fragment>
);

export default Routes;
