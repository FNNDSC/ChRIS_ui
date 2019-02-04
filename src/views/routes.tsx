
import React from 'react'
import {
  BrowserRouter,
  Route,
  Switch
} from 'react-router-dom'

// Add view routes here
import { Dashboard } from './Dashboard';


const Routes: React.FunctionComponent = () => (
  <BrowserRouter>
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        
        {/* ADD MORE ROUTES HERE: <Route  path="/route" component={RouteComponent} /> */}
        <Route render={() => (<div> Sorry, this page does not exist. <a href="/">Go Home</a> </div>)} />
      </Switch>
    </React.Fragment>
  </BrowserRouter>
)


export default Routes;
