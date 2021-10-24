import * as React from "react";
import { useDispatch } from "react-redux";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Alert, PageSection } from "@patternfly/react-core";
import { RouteComponentProps } from "react-router-dom";
import { setSidebarActive } from "../../store/ui/actions";

interface DashboardProps extends RouteComponentProps {
  children: React.ReactNode;
}

const DashboardPage = (props: DashboardProps) => {
  const dispatch = useDispatch();
  const { children } = props;
  const getTitle = () => {
    return (
      <>
        <span>Welcome to the ChRIS UI Dashboard</span>
      </>
    );
  };

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "my_dashboard",
        activeGroup: "dashboard_grp",
      })
    );
  }, [dispatch]);


  return (
    <Wrapper>
      <PageSection>
        <Alert
          aria-label="welcome wagon"
          variant="info"
          title={getTitle()}
        ></Alert>
        {children}
      </PageSection>
    </Wrapper>
  );
};

export default DashboardPage;
