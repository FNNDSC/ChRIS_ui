import React from "react";
import { connect } from "react-redux";
import {
  Grid,
  GridItem,
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent,
} from "@patternfly/react-core";
import { ApplicationState } from "../../store/root/applicationState";

import PluginInformation from "./PluginInformation";
import PluginConfiguration from "./PluginConfiguration";
import PluginOutput from "./PluginOutput";
import "./plugin.scss";
import { LoadingSpinner } from "..";
import { getSelectedFiles } from "../../store/plugin/selector";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getPluginInstanceTitle } from "../../api/models/pluginInstance.model";
interface IState {
  expanded: string[];
}

interface IPluginProps {
  selected?: PluginInstance;
  files?: any[];
  parameters?: any[];
}

class PluginDetailPanel extends React.Component<IPluginProps, IState> {
  constructor(props: IPluginProps) {
    super(props);
    this.state = {
      expanded: ["plugin-detail", "plugin-config", "plugin-data"],
    };
    this.handleDownloadData = this.handleDownloadData.bind(this);
    this.handleViewData = this.handleViewData.bind(this);
  }

  // Description: Download Plugin output data ***** Working
  handleDownloadData() {
    // const { files } = this.props;
    // Stub - To be done
  }

  // Description: View Plugin output data ***** Working
  handleViewData() {
    // const { files } = this.props;
    // Stub - To be done
  }

  render() {
    // Note: Keep toggle of sub panels in local state
    const toggle = (id: string) => {
      const expanded = this.state.expanded;
      const index = expanded.indexOf(id);
      const newExpanded =
        index >= 0
          ? [
              ...expanded.slice(0, index),
              ...expanded.slice(index + 1, expanded.length),
            ]
          : [...expanded, id];
      this.setState(() => ({ expanded: newExpanded }));
    };
    return this.buildContent(toggle);
  }
  // Description: Build content for plugin
  private buildContent(toggle: (id: string) => void) {
    const { selected, parameters, files } = this.props;
    return (
      !!selected && (
        <React.Fragment>
          <h1 className="capitalize">{getPluginInstanceTitle(selected)}</h1>
          <Grid>
            <GridItem className="plugin-details" sm={12} md={4}>
              <DataList aria-label="Plugin Description">
                <DataListItem
                  aria-labelledby="Plugin Description"
                  isExpanded={this.state.expanded.includes("plugin-detail")}
                >
                  <div className="datalist-header">
                    <span className="capitalize">
                      {getPluginInstanceTitle(selected)}
                    </span>
                    <DataListToggle
                      onClick={() => toggle("plugin-detail")}
                      isExpanded={this.state.expanded.includes("plugin-detail")}
                      id="plugin-detail"
                      aria-labelledby="Plugin Description"
                      aria-label="Toggle details for Plugin Description"
                    />
                  </div>
                  <DataListContent
                    aria-label="Primary Content Details for plugin"
                    isHidden={!this.state.expanded.includes("plugin-detail")}
                  >
                    <PluginInformation selected={selected} />
                  </DataListContent>
                </DataListItem>
              </DataList>
            </GridItem>
            <GridItem className="plugin-config" sm={12} md={4}>
              <DataList aria-label="Plugin Configuration">
                <DataListItem
                  aria-labelledby="Plugin Configuration"
                  isExpanded={this.state.expanded.includes("plugin-config")}
                >
                  <div className="datalist-header">
                    Configuration
                    <DataListToggle
                      onClick={() => toggle("plugin-config")}
                      isExpanded={this.state.expanded.includes("plugin-config")}
                      id="plugin-config"
                      aria-labelledby="Plugin Configuration"
                      aria-label="Toggle details for Plugin Configuration"
                    />
                  </div>
                  <DataListContent
                    className={!!!parameters ? "empty" : ""}
                    aria-label="Plugin Configuration"
                    isHidden={!this.state.expanded.includes("plugin-config")}
                  >
                    {!!parameters ? (
                      <PluginConfiguration parameters={parameters} />
                    ) : (
                      <LoadingSpinner size="3x" isLocal color="#777" />
                    )}
                  </DataListContent>
                </DataListItem>
              </DataList>
            </GridItem>
            <GridItem className="plugin-output" sm={12} md={4}>
              <DataList aria-label="Plugin Output">
                <DataListItem
                  aria-labelledby="ex-item1"
                  isExpanded={this.state.expanded.includes("plugin-data")}
                >
                  <div className="datalist-header">
                    Output
                    <DataListToggle
                      onClick={() => toggle("plugin-data")}
                      isExpanded={this.state.expanded.includes("plugin-data")}
                      id="plugin-data"
                      aria-labelledby="Plugin Output"
                      aria-label="Toggle details for Plugin Output"
                    />
                  </div>
                  <DataListContent
                    className={!!!files ? "empty" : ""}
                    aria-label="Plugin Output"
                    isHidden={!this.state.expanded.includes("plugin-data")}
                  >
                    {!!files ? (
                      <PluginOutput
                        files={files}
                        handleDownloadData={this.handleDownloadData}
                        handleViewData={this.handleViewData}
                      />
                    ) : (
                      <LoadingSpinner size="3x" isLocal color="#777" />
                    )}
                  </DataListContent>
                </DataListItem>
              </DataList>
            </GridItem>
          </Grid>
        </React.Fragment>
      )
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.feed.selected,
  files: getSelectedFiles(state),
  parameters: state.plugin.parameters,
});

export default connect(mapStateToProps, null)(PluginDetailPanel);
