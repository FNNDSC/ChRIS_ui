import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import "../../components/pipelines/Pipelines.scss";
import PipelineNav from "./components/PipelineNav";

const PipelinesPage = () => {
  return (
    <Wrapper>
      <PipelineNav />
    </Wrapper>
  );
};

export default PipelinesPage;
