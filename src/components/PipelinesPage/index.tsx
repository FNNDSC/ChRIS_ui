import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { PageSection } from "@patternfly/react-core";
import { useEffect } from "react";
import type * as DoUI from "../../reducers/ui";
import { InfoSection } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineProvider } from "../PipelinesCopy/context";
import Wrapper from "../Wrapper";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const { useUI } = props;
  useEffect(() => {
    document.title = "Packages Catalog";
  }, []);

  return (
    <Wrapper useUI={useUI} titleComponent={<InfoSection title="Packages" />}>
      <PageSection>
        <PipelineProvider>
          <Pipelines />
        </PipelineProvider>
      </PageSection>
    </Wrapper>
  );
};
