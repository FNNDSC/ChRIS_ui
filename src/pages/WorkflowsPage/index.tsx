import React from "react";
import { useDispatch } from "react-redux";
import Wrapper from "../../containers/Layout/PageWrapper";
import StudyList from "./StudyList";
import FileDetails from "./FileDetails";
import PatientLookup from "./PatientLookup";
import { setSidebarActive } from "../../store/ui/actions";
import { resetWorkflowState } from "../../store/workflows/actions";
import "./Workflows.scss";

const WorkflowsPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeGroup: "workflows_grp",
        activeItem: "my_workflows",
      })
    );
  }, [dispatch]);

  React.useEffect(() => {
    return () => {
      dispatch(resetWorkflowState());
    };
  }, [dispatch]);

  return (
    <Wrapper>
      <PatientLookup />
      <StudyList />
      <FileDetails />
    </Wrapper>
  );
};

export default WorkflowsPage;
