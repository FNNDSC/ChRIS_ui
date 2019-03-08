import * as React from "react";
import { FormEvent } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Tabs, Tab } from "@patternfly/react-core";
import DicomViewer from "./dicomViewer";
import DataTableViewer from "./dataTableViewer";
import FileBrowserViewer from "./fileBrowserViewer";
import "./viewer.scss";
type AllProps = RouteComponentProps;
class OutputViewerContainer extends React.Component<
  {},
  { activeTabKey: number }
> {
  constructor(props: {}) {
    super(props);
    this.handleTabClick = this.handleTabClick.bind(this);
  }
  state = {
    activeTabKey: 0  // TEMP ***** set to 2
  };
  // Toggle currently active tab
  handleTabClick = (event: FormEvent<HTMLInputElement>, tabIndex: number) => {
    this.setState({
      activeTabKey: tabIndex
    });
  }
  render() {
    return (
      <div className="output-viewer">
        <Tabs
          activeKey={this.state.activeTabKey}
          onSelect={this.handleTabClick} >
          <Tab eventKey={0} title="DICOM Viewer">
            <DicomViewer data={[]} />
          </Tab>
          <Tab eventKey={1} title="Data Table">
            <DataTableViewer data={[]} />
          </Tab>
          <Tab eventKey={2} title="File Browser">
            <FileBrowserViewer data={[]} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default OutputViewerContainer;
