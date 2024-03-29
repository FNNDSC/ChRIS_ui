import { Navigate, useLocation } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const location = useLocation();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate to={`/login?redirectTo=${location.pathname}${location.search}`} />
  );
};

export default PrivateRoute;
