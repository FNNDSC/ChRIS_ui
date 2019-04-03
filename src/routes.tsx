
import React from "react";
import {
  Route,
  Switch,
} from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";

// Add view routes here
import { Dashboard } from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import {LogIn} from "./pages/LogIn/Login";
import {NotFound} from "./pages/NotFound/NotFound";
import { Charts } from "./pages/Charts/Charts";


const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/charts" component={Charts} />
        <Route exact path="/login" component={LogIn} />
        <PrivateRoute  path="/feeds" component={FeedsPage} />  {/* Optional: redirectPath="/" */}
        {/* ADD MORE ROUTES HERE: <Route  path="/route" component={RouteComponent} /> */}
        {/* 404 Page Not found  */}
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
);




export default Routes;
