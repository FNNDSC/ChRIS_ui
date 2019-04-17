import React, { FormEvent } from "react";
import { connect } from "react-redux";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { ApplicationState } from "../../store/root/applicationState";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import {
  DicomViewer,
  RevViewer,
  DataTableViewer,
  FreesurferDataTable,
  ZScoreDataTable,
  FileBrowserViewer
} from "./displays/index";
import VolumeGrowth from "../../components/chart/VolumeGrowth";
import SegmentAnalysis from "../../components/chart/SegmentAnalysis";
import "./viewer.scss";

type AllProps = {
  files?: IFeedFile[];
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
            children={tabs} />
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
    const { files, selected } = this.props;
    const tabs: any[] = [];
    if (!!selected) {
      const tabArr = tempMapping[selected.plugin_name] || tempMapping.default;
      tabArr.forEach((key: string, i: number) => {
        let tabContent;
        let label = "tab";
        switch (key) {
          case "ZScoreViewer":
            label = "Viewer";
            tabContent = !!files && <DicomViewer pluginType="ZScoreViewer" />;
            break;
          case "DicomViewer_3D":
            label = "3D Viewer";
            tabContent = !!files && <DicomViewer pluginType="DicomViewer_3D" />;
            break;
          case "DicomViewer_2D":
            label = "Viewer";
            tabContent = !!files && <DicomViewer pluginType="DicomViewer_2D" />;
            break;
          case "RevViewer":
            label = "Viewer";
            tabContent = !!files && <RevViewer files={files} />;
            break;
          case "FileBrowserViewer":
            label = "File Browser";
            tabContent = (!!files && !!selected) && <FileBrowserViewer files={files} selected={selected} />;
            break;
          case "DataTableViewer":
            label = "Data Table";
            tabContent = !!files && <DataTableViewer files={files} />;
            break;
          case "ZScoreDataTable":
            label = "Data Table";
            tabContent = !!files && <ZScoreDataTable files={files} />;
            break;
          case "FreesurferDataTable":
            label = "FreeSurfer Data";
            tabContent = !!files && <FreesurferDataTable files={files} />;
            break;
          case "VolumeGrowth":
            label = "Volume";
            tabContent = (<React.Fragment>
                <h1 className="pf-c-title pf-u-m-xl">Volume Segments</h1>
                <VolumeGrowth />
              </React.Fragment>)
            break;
          case "SegmentAnalysis":
            label = "Segment";
            tabContent = (<React.Fragment>
                <h1 className="pf-c-title pf-u-m-xl">Z-Score</h1>
                <SegmentAnalysis />;
            </React.Fragment>)
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
  mri10yr06mo01da_normal: ["RevViewer", "FileBrowserViewer"], // This is temp for custom display
  freesurfer_pp: ["DicomViewer_2D", "DicomViewer_3D", "FreesurferDataTable", "FileBrowserViewer"],
  simpledsapp: ["VolumeGrowth", "SegmentAnalysis", "ZScoreDataTable", "FileBrowserViewer"],
  mpcs: ["VolumeGrowth", "SegmentAnalysis", "ZScoreDataTable", "FileBrowserViewer"],
  z2labelmap: ["ZScoreViewer", "FileBrowserViewer"]
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  files: plugin.files,
  selected: plugin.selected,
});

export default connect(
  mapStateToProps,
  null
)(OutputViewerContainer);
