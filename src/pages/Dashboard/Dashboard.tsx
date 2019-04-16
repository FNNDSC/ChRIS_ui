import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";

type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI site";
  }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection variant={PageSectionVariants.darker}>
          <h1>Hippocampal Volume</h1>
        </PageSection>
        <PageSection>
          <Alert
                aria-label="welcome wagon"
                variant="info"
                title="Welcome!"  >
                Welcome to ChRIS UI site's Dashboard
              </Alert>
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
