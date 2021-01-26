import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Alert, PageSection, Badge } from "@patternfly/react-core";
import Moment from 'react-moment'

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI site";
  }

  getTitle=()=>{
    return (
      <>
        <span>Welcome to the ChRIS UI Dashboard</span>
      </>
    );
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection>
          <Alert aria-label="welcome wagon" variant="info" title={this.getTitle()}>
          </Alert>
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}

export { DashboardPage as Dashboard };
