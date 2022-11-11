import React from "react";
import { useDispatch } from "react-redux";
import { PipelineProvider } from "../../components/feed/CreateFeed/context";
import PipelineContainer from "../../components/feed/CreateFeed/PipelineContainer";
import Wrapper from "../Layout/PageWrapper";
import { setSidebarActive } from "../../store/ui/actions";

const PipelinePage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Analysis Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "catalog",
      })
    );
  });
  return (
    <Wrapper>
      <PipelineProvider>
        <PipelineContainer />
      </PipelineProvider>
    </Wrapper>
  );
};

export default PipelinePage;
