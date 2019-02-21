
import React from 'react'
import {
  BrowserRouter,
  Route,
  Switch
} from 'react-router-dom'

// Add view routes here
import { Dashboard } from './pages/Dashboard/Dashboard';
import FeedsPage from './pages/Feeds/Feeds';
import {LogIn} from './pages/LogIn/Login';
import {NotFound} from './pages/NotFound/NotFound';


const Routes: React.FunctionComponent = () => (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/login" component={LogIn} />
        <Route path="/feeds" component={FeedsPage} />
        {/* ADD MORE ROUTES HERE: <Route  path="/route" component={RouteComponent} /> */}
        {/* 404 Page Not found  */}
        <Route component={NotFound} />
      </Switch>
    </React.Fragment>
)


export default Routes;
