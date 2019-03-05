import React from "react";
import { connect } from "react-redux";
import {
  Button,
  Grid,
  GridItem,
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent
} from "@patternfly/react-core";
import { EyeIcon, DownloadIcon } from "@patternfly/react-icons";
import { ApplicationState } from "../../store/root/applicationState";
import { IPluginState } from "../../store/plugin/types";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import PluginInformation from "./pluginInformation";
import PluginConfiguration from "./pluginConfiguration";
import "./plugin.scss";

interface IState {
  expanded: string[];
}

type AllProps = IPluginState;
class PluginDetailPanel extends React.Component<AllProps, IState> {
  constructor(props: AllProps) {
    super(props);
    this.state = {
      expanded: ["plugin-detail", "plugin-config", "plugin-data"]
    };
  }

  // Description: Download Plugin output data ***** Working
  handleDownloadData() {
    // Stub - To be done
    console.log("handleDownloadData");
  }

  // Description: View Plugin output data ***** Working
  handleViewData() {
    // Stub - To be done
    console.log("handleViewData");
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
              ...expanded.slice(index + 1, expanded.length)
            ]
          : [...expanded, id];
      this.setState(() => ({ expanded: newExpanded }));
    };
    const { selected } = this.props;
    return !!selected && this.buildContent(selected, toggle);
  }

  private buildContent(selected: IPluginItem, toggle: (id: string) => void) {
    return (
      <React.Fragment>
        <h1>{selected.plugin_name}</h1>
        <Grid>
          <GridItem className="plugin-details" sm={12} md={4}>
            <DataList aria-label="Plugin Description">
              <DataListItem
                aria-labelledby="Plugin Description"
                isExpanded={this.state.expanded.includes("plugin-detail")}
              >
                {selected.plugin_name}

                <DataListToggle
                  onClick={() => toggle("plugin-detail")}
                  isExpanded={this.state.expanded.includes("plugin-detail")}
                  id="plugin-detail"
                  aria-labelledby="Plugin Description"
                  aria-label="Toggle details for Plugin Description"
                />
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
                Configuration
                <DataListToggle
                  onClick={() => toggle("plugin-config")}
                  isExpanded={this.state.expanded.includes("plugin-config")}
                  id="plugin-config"
                  aria-labelledby="Plugin Configuration"
                  aria-label="Toggle details for Plugin Configuration"
                />
                <DataListContent
                  aria-label="Plugin Configuration"
                  isHidden={!this.state.expanded.includes("plugin-config")}
                >
                  <PluginConfiguration  />
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
                Output
                <DataListToggle
                  onClick={() => toggle("plugin-data")}
                  isExpanded={this.state.expanded.includes("plugin-data")}
                  id="plugin-data"
                  aria-labelledby="Plugin Output"
                  aria-label="Toggle details for Plugin Output"
                />
                <DataListContent
                  aria-label="Plugin Output"
                  isHidden={!this.state.expanded.includes("plugin-data")}
                >
                  <div>
                    <label>Data:</label> 18 files (156.1MB)
                  </div>
                  <div className="btn-div">
                    <Button
                      variant="secondary"
                      isBlock
                      onClick={this.handleDownloadData}
                    >
                      <DownloadIcon /> Download Data
                    </Button>
                    <Button
                      variant="secondary"
                      isBlock
                      onClick={this.handleViewData}
                    >
                      <EyeIcon /> View Data
                    </Button>
                  </div>
                </DataListContent>
              </DataListItem>
            </DataList>
          </GridItem>
        </Grid>
      </React.Fragment>
    );
  }
}

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   getPluginFilesRequest: (url: string) => dispatch(getPluginFilesRequest(url)),
//   getPluginParametersRequest: (url: string) => dispatch(getPluginParametersRequest(url))
// });

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  selected: plugin.selected,
  // files: plugin.files,
  // parameters: plugin.parameters
});
export default connect(
  mapStateToProps,
  null
)(PluginDetailPanel);
