import { PageSection } from "@patternfly/react-core";
import React from "react";
import { InfoSection } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineProvider } from "../PipelinesCopy/context";
import WrapperConnect from "../Wrapper";

const PipelinePage = () => {
  React.useEffect(() => {
    document.title = "Pipelines Catalog";
  }, []);
  return (
    <WrapperConnect titleComponent={<InfoSection title="Pipelines" />}>
      <PageSection>
        <PipelineProvider>
          <Pipelines />
        </PipelineProvider>
      </PageSection>
    </WrapperConnect>
  );
};

export default PipelinePage;
