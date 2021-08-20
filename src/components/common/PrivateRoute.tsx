import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);

  if (isLoggedIn)
    return <Route {...props} />

  return <Redirect to={`/login?then=${props.location?.pathname}`} />;
};

export default PrivateRoute;
