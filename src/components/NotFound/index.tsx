import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { Alert } from "@patternfly/react-core";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import Wrapper from "../Wrapper";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { useUI, useUser, useDrawer } = props;
  return (
    <Wrapper useUI={useUI} useUser={useUser} useDrawer={useDrawer}>
      <Alert
        title="Page Not Found"
        variant="danger"
        aria-label="Page not found"
      >
        Go{" "}
        <a href="/" target="_PARENT">
          Home
        </a>{" "}
      </Alert>
    </Wrapper>
  );
};
