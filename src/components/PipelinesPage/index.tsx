import React from "react";
import { PipelineProvider } from "../PipelinesCopy/context";
import Pipelines from "../PipelinesCopy";
import WrapperConnect from "../Wrapper";

import { PageSection } from "@patternfly/react-core";

const PipelinePage = () => {
  React.useEffect(() => {
    document.title = "Pipelines Catalog";
  }, []);
  return (
    <WrapperConnect>
      <PageSection>
        <PipelineProvider>
          <Pipelines />
        </PipelineProvider>
      </PageSection>
    </WrapperConnect>
  );
};

export default PipelinePage;
