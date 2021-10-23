import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

const PublicRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);

  if (!isLoggedIn) return <Route {...props} />;

  return <Redirect to={`/`} />;
};

export default PublicRoute;
