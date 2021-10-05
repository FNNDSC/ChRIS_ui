import React from "react";
import { useDispatch } from "react-redux";
import "../../components/pipelines/Pipelines.scss";
import Wrapper from "../../containers/Layout/PageWrapper";
import { setSidebarActive } from "../../store/ui/actions";
import PipelinesFeed from "../../components/pipelines/PipelinesFeed";

const PipelinesPage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "my_pipelines",
        activeGroup: "pipeline_grp",
      })
    );
  }, [dispatch]);
  return (
    <Wrapper>
      <PipelinesFeed />
    </Wrapper>
  );
};

export default PipelinesPage;
