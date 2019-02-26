import React from "react";
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
import Moment from "react-moment";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

interface INodeProps {
  selected: IPluginItem;
}

interface IState {
  expanded: string[];
}

class PluginDetailPanel extends React.Component<INodeProps, IState> {
  constructor(props: INodeProps) {
    super(props);
    this.state = {
      expanded: ["plugin-detail", "plugin-config", "plugin-data"]
    };
  }

  // Description: Download Plugin output data ***** Working
  handleDownloadData() {
     // Stub - To be done
  }

  // Description: View Plugin output data ***** Working
  handleViewData() {
    // Stub - To be done
  }

  render() {
    const { selected } = this.props;

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
                  <div>
                    <label>Status:</label> {selected.status}
                  </div>
                  <div>
                    <label>Start Date:</label>{" "}
                    <Moment format="DD MMM YYYY @ HH:MM A">
                      {selected.start_date}
                    </Moment>
                  </div>
                  <div>
                    <label>End Date:</label>{" "}
                    <Moment format="DD MMM YYYY @ HH:MM A">
                      {selected.end_date}
                    </Moment>
                  </div>
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
                  <div>
                    <label>config Parameter 1:</label> $VALUE_1
                  </div>
                  <div>
                    <label>config Parameter 2:</label> $VALUE_2
                  </div>
                  <div>
                    <label>config Parameter 3:</label> $VALUE_3
                  </div>
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

export default PluginDetailPanel;
