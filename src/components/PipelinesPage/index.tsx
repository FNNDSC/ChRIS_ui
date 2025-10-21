import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import type * as DoDrawer from "../../reducers/drawer";
import type * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineProvider } from "../PipelinesCopy/context";
import Wrapper from "../Wrapper";

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
  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isStaff } = user;

  useEffect(() => {
    document.title = "Packages Catalog";
  }, []);

  return (
    <Wrapper
      useUI={useUI}
      useUser={useUser}
      useDrawer={useDrawer}
      title={<InfoSection title="Packages" />}
    >
      <PageSection>
        <PipelineProvider>
          <Pipelines isStaff={isStaff} />
        </PipelineProvider>
      </PageSection>
    </Wrapper>
  );
};
