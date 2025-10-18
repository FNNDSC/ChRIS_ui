import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import type * as DoUI from "../../reducers/ui";
import type * as DoUser from "../../reducers/user";
import { InfoSection } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineProvider } from "../PipelinesCopy/context";
import Wrapper from "../Wrapper";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { useUI, useUser } = props;
  useEffect(() => {
    document.title = "Packages Catalog";
  }, []);

  return (
    <Wrapper
      useUI={useUI}
      useUser={useUser}
      titleComponent={<InfoSection title="Packages" />}
    >
      <PageSection>
        <PipelineProvider>
          <Pipelines />
        </PipelineProvider>
      </PageSection>
    </Wrapper>
  );
};
