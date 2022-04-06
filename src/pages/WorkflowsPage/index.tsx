import React from "react";
import { useDispatch } from "react-redux";
import { Backdrop, Bullseye, Spinner } from "@patternfly/react-core";
import Wrapper from "../Layout/PageWrapper";
import { setSidebarActive } from "../../store/ui/actions";
import { resetWorkflowState } from "../../store/workflows/actions";
import "./Workflows.scss";

const FileDetails = React.lazy(() => import("./FileDetails"));

const WorkflowsPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.title = "Run a Quick Workflow";
    dispatch(
      setSidebarActive({
        activeItem: "workflows",
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
      <React.Suspense
        fallback={
          <Backdrop>
            <Bullseye>
              <Spinner />
            </Bullseye>
          </Backdrop>
        }
      >
        <FileDetails />
      </React.Suspense>
    </Wrapper>
  );
};

export default WorkflowsPage;
