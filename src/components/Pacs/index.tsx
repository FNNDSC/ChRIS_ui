import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";
import Title from "./Title";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
};

export default (props: Props) => {
  const { useUI, useUser, useDrawer } = props;
  return (
    <Wrapper
      useUI={useUI}
      useUser={useUser}
      useDrawer={useDrawer}
      title={<Title />}
    >
      <PacsApp />
    </Wrapper>
  );
};
