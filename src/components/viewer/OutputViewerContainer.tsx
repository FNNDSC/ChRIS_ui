import * as React from "react";
import { FormEvent } from "react";
import { connect } from "react-redux";
import { Tabs, Tab } from "@patternfly/react-core";
import { ApplicationState } from "../../store/root/applicationState";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IUITreeNode } from "../../api/models/file-explorer";
import DicomViewer from "./dicomViewer";
import DataTableViewer from "./dataTableViewer";
import FileBrowserViewer from "./fileBrowserViewer";
import VolumeGrowth from "../../components/chart/VolumeGrowth";
import SegmentAnalysis from "../../components/chart/SegmentAnalysis";
import "./viewer.scss";

type AllProps = {
  files?: IFeedFile[];
  explorer?: IUITreeNode;
};

class OutputViewerContainer extends React.Component<AllProps, { activeTabKey: number }> {
  constructor(props: AllProps) {
    super(props);
    this.handleTabClick = this.handleTabClick.bind(this);
  }
  state = {
    activeTabKey: 0 // Temp - set to 0
  };

  // Toggle currently active tab
  handleTabClick = (event: FormEvent<HTMLInputElement>, tabIndex: number) => {
    this.setState({
      activeTabKey: tabIndex
    });
  }
  render() {
    const { files, explorer } = this.props;
    return (
      (!!files && files.length && !!explorer ) && <div className="output-viewer">
        <Tabs
          activeKey={this.state.activeTabKey}
          onSelect={this.handleTabClick} >
          <Tab eventKey={0} title="Viewer">
            <DicomViewer files={files} />
          </Tab>
          <Tab eventKey={1} title="Data Table">
            <DataTableViewer files={files} />
          </Tab>
          <Tab eventKey={2} title="File Browser">
            <FileBrowserViewer files={files} explorer={explorer} />
          </Tab>
          <Tab eventKey={3} title="Volume">
            <VolumeGrowth />
          </Tab>
          <Tab eventKey={4} title="Segment">
            <SegmentAnalysis />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  files: plugin.files,
  explorer: plugin.explorer
});

export default connect(
  mapStateToProps,
  null
)(OutputViewerContainer);
