import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Tabs, Tab, PageSection } from "@patternfly/react-core";
import SegmentAnalysis from "../../components/chart/SegmentAnalysis";
import VolumeGrowth from "../../components/chart/VolumeGrowth";

type AllProps = RouteComponentProps;

class ChartsPage extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    this.handleTabClick = this.handleTabClick.bind(this);
  }
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI site";
  }
  state = {
    activeTabKey: 0 // Temp - set to 0
  };

  // Toggle currently active tab
  handleTabClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: React.ReactText) => {
    this.setState({
      activeTabKey: tabIndex
    });
  };
  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        <PageSection>
          <div className="white-bg pf-u-p-lg">
          <h1 className="pf-u-mb-lg">Charts Sandbox</h1>
            <Tabs
              activeKey={this.state.activeTabKey}
              onSelect={this.handleTabClick}           >
              <Tab eventKey={0} title="Volume">
                <VolumeGrowth />
              </Tab>
              <Tab eventKey={1} title="Segment">
                <SegmentAnalysis />
              </Tab>
            </Tabs>
            {children}
          </div>
        </PageSection>
      </Wrapper>
    );
  }
}

export { ChartsPage as Charts };
