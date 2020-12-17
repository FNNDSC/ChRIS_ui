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
        <span
          style={{
            marginBottom: "0.5rem",
            fontSize: "24px",
            display: "block",
          }}
        >
          Welcome to the ChRIS UI Dashboard
        </span>
        <Badge
          style={{
            marginRight: "1rem",
            display: "inline-block",
          }}
          key={4}
        >
          <span>Version: 1.0.5</span>
        </Badge>
        <Badge key={3}>
          <span>
            Latest update:{" "}
            <Moment format="DD MMM YYYY @ HH:mm">{`2020-12-17T10:30:14.297464-04:00`}</Moment>
          </span>
        </Badge>
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
