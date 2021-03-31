import React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { Route, Redirect } from "react-router-dom";


// Description: Protected routes. Only show if user is logged in
// Pass an optional param: redirectPath - for passing a redirect option to another path / defaults to "/login"
interface PrivateRouteProps {
  component: React.FC<any>;
  path: string;
  exact?: boolean;
  isLoggedIn?: boolean;
}



const PrivateRoute: React.FC<PrivateRouteProps> = (
  props: PrivateRouteProps
) => {
  const { isLoggedIn } = props;

  return isLoggedIn ? <Route {...props} /> : <Redirect to="/login" />;
};

const mapStateToProps = ({ user }: ApplicationState) => ({
  isLoggedIn: user.isLoggedIn,
});

// export default PrivateRoute;
export default connect(mapStateToProps, null)(PrivateRoute);
