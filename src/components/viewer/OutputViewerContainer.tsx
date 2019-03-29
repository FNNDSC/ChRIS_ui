import * as React from "react";
import { FormEvent } from "react";
import { connect } from "react-redux";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { ApplicationState } from "../../store/root/applicationState";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IUITreeNode } from "../../api/models/file-explorer";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import DicomViewer from "./dicomViewer";
import RevViewer from "./revViewer";
import DataTableViewer from "./dataTableViewer";
import FreesurferDataTable from "./freesurferDataTable";
import FileBrowserViewer from "./fileBrowserViewer";
import VolumeGrowth from "../../components/chart/VolumeGrowth";
import SegmentAnalysis from "../../components/chart/SegmentAnalysis";
import "./viewer.scss";

type AllProps = {
  files?: IFeedFile[];
  explorer?: IUITreeNode;
  selected?: IPluginItem;
};

class OutputViewerContainer extends React.Component<AllProps, { activeTabKey: number }> {
  constructor(props: AllProps) {
    super(props);
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  state = {
    activeTabKey: 0
  };

  render() {
    const tabs = this.buildTabArray();
    return (
      <div className="output-viewer">
        {!!tabs && tabs.length ? (
          <Tabs
            activeKey={this.state.activeTabKey}
            onSelect={this.handleTabClick}
            children={tabs}
          />
        ) : (
          <Alert variant="info" title="Empty Result Set" className="empty" />
        )}
      </div>
    );
  }

  // Description: Toggle currently active tab
  handleTabClick = (event: FormEvent<HTMLInputElement>, tabIndex: number) => {
    this.setState({
      activeTabKey: tabIndex
    });
  }
  // Description: Build Tabs from data
  buildTabArray = () => {
    const { files, explorer, selected } = this.props;
    const tabs: any[] = [];
    if (!!selected) {
      const tabArr = tempMapping[selected.plugin_name] || tempMapping.default;
      tabArr.forEach((key: string, i: number) => {
        let tabContent;
        let label = "tab";
        switch (key) {
          case "DicomViewer":
            label = "Viewer";
            tabContent = !!files && <DicomViewer files={files} />;
            break;
          case "RevViewer":
            label = "Viewer";
            tabContent = !!files && <RevViewer files={files} />;
            break;
          case "FileBrowserViewer":
            label = "File Browser";
            tabContent = !!files && !!explorer && <FileBrowserViewer files={files} explorer={explorer} />;
            break;
          case "DataTableViewer":
            label = "Data Table";
            tabContent = !!files && <DataTableViewer files={files} />;
            break;
          case "FreesurferDataTable":
            label = "FreeSurfer Data";
            tabContent = !!files && <FreesurferDataTable files={files} />;
            break;
          case "VolumeGrowth":
            label = "Volume";
            tabContent = <VolumeGrowth />;
            break;
          case "SegmentAnalysis":
            label = "Segment";
            tabContent = <SegmentAnalysis />;
            break;
        }
        tabs.push(<Tab eventKey={i} title={label}>
          {tabContent}
        </Tab>);
      });
    }
    return tabs;
  }
}
// Description: Temporary mapping for plugin tabs
const tempMapping: any = {
  default: ["FileBrowserViewer"],
  dircopy: ["RevViewer", "FileBrowserViewer"],
  pacscopy: ["RevViewer", "FileBrowserViewer"],
  freesurfer_pp: ["DicomViewer", "FreesurferDataTable", "FileBrowserViewer"], // Notes: Nice to have viewer 3D Map image "DicomViewer",
  simpledsapp: ["VolumeGrowth", "SegmentAnalysis", "DataTableViewer"],
  z2labelmap: ["DicomViewer", "FileBrowserViewer"]
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  files: plugin.files,
  explorer: plugin.explorer,
  selected: plugin.selected
});

export default connect(
  mapStateToProps,
  null
)(OutputViewerContainer);
