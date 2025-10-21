import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Navigate } from "react-router-dom";
import * as DoUser from "../../reducers/user";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  children: JSX.Element;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { children, useUser } = props;
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn, isInit } = user;
  const redirectTo = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );

  return isLoggedIn || !isInit ? (
    children
  ) : (
    <Navigate to={`/login?redirectTo=${redirectTo}`} />
  );
};
