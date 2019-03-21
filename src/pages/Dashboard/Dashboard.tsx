import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/layout/PageWrapper";
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
import VolumeGrowth from "../../components/chart/VolumeGrowth";
import SegmentAnalysis from "../../components/chart/SegmentAnalysis";
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
          <SegmentAnalysis />
          {children}
        </PageSection>
      </Wrapper>
    );
  }
}


export { DashboardPage as Dashboard };
