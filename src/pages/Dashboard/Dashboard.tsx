import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from '../../containers/layout/PageWrapper';
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI Demo site";
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.darker}>
          <h1>Hippocampal Volume</h1>
        </PageSection>
        <PageSection>
          <div>
            <h1 className="pf-u-mb-md">Welcome to ChRIS UI Demo site's Dashboard</h1>
            <Alert
              aria-label="welcome wagon"
              variant="info"
              title="Welcome!"  >
              Welcome to ChRIS UI Demo site's Dashboard
        </Alert>
          </div>
          {children}
        </PageSection>
      </Wrapper>

    );
  }
}

export { DashboardPage as Dashboard };
