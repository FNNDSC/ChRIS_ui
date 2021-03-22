import * as React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Alert, PageSection } from "@patternfly/react-core";
import { RouteComponentProps } from "react-router-dom";

interface DashboardProps extends RouteComponentProps {
  children: React.ReactNode;
}

const DashboardPage = (props: DashboardProps) => {
  const { children } = props;
  const getTitle = () => {
    return (
      <>
        <span>Welcome to the ChRIS UI Dashboard</span>
      </>
    );
  };
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
