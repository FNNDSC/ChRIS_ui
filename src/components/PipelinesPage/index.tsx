import React from "react";
import { useDispatch } from "react-redux";
import { PipelineProvider } from "../CreateFeed/context";
import PipelineContainer from "../CreateFeed/PipelineContainter";
import WrapperConnect from "../Wrapper";
import { setSidebarActive } from "../../store/ui/actions";
import { PageSection } from "@patternfly/react-core";

const PipelinePage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Pipelines Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "pipelines",
      }),
    );
  });
  return (
    <WrapperConnect>
      <PageSection>
        <PipelineProvider>
          <PipelineContainer justDisplay={true} />
        </PipelineProvider>
      </PageSection>
    </WrapperConnect>
  );
};

export default PipelinePage;
