import React from "react";
import { PageSection } from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { PipelineProvider } from "../../components/feed/CreateFeed/context";
import PipelineContainer from "../../components/feed/CreateFeed/PipelineContainer";
import Wrapper from "../Layout/PageWrapper";
import { setSidebarActive } from "../../store/ui/actions";

const PipelinePage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Pipelines Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "pipelines",
      })
    );
  });
  return (
    <Wrapper>
      <PageSection variant="darker">
        <PipelineProvider>
          <PipelineContainer justDisplay={true} />
        </PipelineProvider>
      </PageSection>
    </Wrapper>
  );
};

export default PipelinePage;
