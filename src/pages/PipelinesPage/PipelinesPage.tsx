import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import PipelinesFeed from "./components/PipelinesFeed";
import "../../components/pipelines/Pipelines.scss"

const PipelinesPage = () => {
  return (
    <Wrapper>
      <PipelinesFeed />
    </Wrapper>
  );
};

export default PipelinesPage;
