import React from "react";
import { connect } from "react-redux";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { ApplicationState } from "../../store/root/applicationState";
import { FeedFile, PluginInstance } from "@fnndsc/chrisapi";
import { pluginViewerMap } from "../../api/models/file-viewer.model";
import { FileBrowserViewer } from "./displays";
import "./viewer.scss";
import { getSelectedFiles } from "../../store/plugin/selector";

type AllProps = {
  files?: FeedFile[];
  selected?: PluginInstance;
};

class OutputViewerContainer extends React.Component<
  AllProps,
  { activeTabKey: number }
> {
  constructor(props: AllProps) {
    super(props);
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  state = {
    activeTabKey: 0,
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
  handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: React.ReactText
  ) => {
    this.setState({
      activeTabKey: tabIndex as number,
    });
  };
  // Description: Build Tabs from data
  buildTabArray = () => {
    const { files, selected } = this.props;

    const tabs: any[] = [];
    if (!!selected) {
      const plugin_name = selected.data.plugin_name.split("-")[1];

      const tabArr = pluginViewerMap[plugin_name] || pluginViewerMap.default;

      tabArr.forEach((key: string, i: number) => {
        let tabContent;
        let label = "tab";
        switch (key) {
          case "FileBrowserViewer":
            label = "File Browser";
            tabContent = !!files && !!selected && (
              <FileBrowserViewer files={files} selected={selected} />
            );
            break;
        }
        tabs.push(
          <Tab eventKey={i} title={label}>
            {tabContent}
          </Tab>
        );
      });
    }
    return tabs;
  };
}

const mapStateToProps = (state: ApplicationState) => ({
  files: getSelectedFiles(state),
  selected: state.feed.selected,
});

export default connect(mapStateToProps, null)(OutputViewerContainer);
