import React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import {
  Route,
  RouteComponentProps,
  RouteProps,
  Redirect
} from "react-router-dom";
import { IUserState } from "../../store/user/types";

// Description: Protected routes. Only show if user is logged in
// Pass an optional param: redirectPath - for passing a redirect option to another path / defaults to "/login"
interface PrivateRouteProps extends RouteProps {
  redirectPath?: string;
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}

type RenderComponent = ((props: RouteComponentProps<any>) => React.ReactNode);
type AllProps = PrivateRouteProps & IUserState;
class PrivateRoute extends Route<AllProps> {
  render() {
    const {
      component: Component,
      redirectPath,
      isLoggedIn,
      ...rest
    } = this.props;

    // const isLoggedIn = this.props.isLoggedIn;
    const renderComponent: RenderComponent = (props) =>
      isLoggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to={redirectPath || "/login"} />
      );

    return <Route {...rest} render={renderComponent} />;
  }
}

const mapStateToProps = ({  user }: ApplicationState) => ({
    isLoggedIn: user.isLoggedIn
});

// export default PrivateRoute;
export default connect(
  mapStateToProps,
  null
)(PrivateRoute);
