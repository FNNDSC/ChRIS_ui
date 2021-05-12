import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import ChrisApiClient from "../../api/chrisapiclient";
import { setSidebarActive } from "../../store/ui/actions";
import { useDispatch } from "react-redux";

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
    async function fetchPacsFiles() {
      const client = ChrisApiClient.getClient();
      try {
        //@ts-ignore
        const files = await client.getPACSFiles();
        console.log("Files", files);
      } catch (error) {
        console.log("Error", error);
      }
    }

    fetchPacsFiles();
  }, []);

  return (
    <Wrapper>
      <div>My Workflows</div>
    </Wrapper>
  );
};

export default WorkflowsPage;
