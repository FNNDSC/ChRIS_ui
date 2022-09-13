import React from "react";
import { Navigate } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);

  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
