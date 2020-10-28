import React from "react";
import Moment from "react-moment";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";

import {
  Button,
  Grid,
  GridItem,
  Title,
  PopoverPosition,
} from "@patternfly/react-core";
import { Plugin, PluginInstanceParameter } from "@fnndsc/chrisapi";
import {
  TerminalIcon,
  CaretDownIcon,
  CalendarDayIcon,
  CheckIcon,
  ErrorCircleOIcon,
  MixcloudIcon,
  CloudUploadAltIcon,
  DockerIcon,
  StorageDomainIcon,
  OnRunningIcon,
  ServicesIcon,
  FileArchiveIcon,
  OutlinedClockIcon,
  InProgressIcon,
} from "@patternfly/react-icons";

import { PluginInstance } from "@fnndsc/chrisapi";
import TextCopyPopover from "../../common/textcopypopover/TextCopyPopover";
import AddNode from "../AddNode/AddNode";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PluginStatus } from "../../../store/plugin/types";
import { displayDescription } from "../FeedOutputBrowser/utils";

interface INodeProps {
  selected: PluginInstance;
  descendants: PluginInstance[];
  pluginStatus?: PluginStatus[];
  pluginLog?: {};
  isComputeError?:boolean
}

interface INodeState {
  plugin?: Plugin;
  params?: PluginInstanceParameter[];
}

class NodeDetails extends React.Component<INodeProps, INodeState> {
  constructor(props: INodeProps) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    this.fetchPluginData();
  }

  async componentDidUpdate(prevProps: INodeProps) {
    const { selected: prevSelected } = prevProps;
    const { selected } = this.props;
    if (prevSelected.data.id !== selected.data.id) {
      this.fetchPluginData();
    }
  }

  async fetchPluginData() {
    const { selected } = this.props;

    const params = await selected.getParameters({});
    const plugin = await selected.getPlugin();

    this.setState({
      plugin: plugin,
      params: params.getItems(),
    });
  }

  getCurrentTitleFromStatus(statusLabels: PluginStatus[]) {
    const currentTitle = statusLabels
      .map((label) => {
        const computedTitle = displayDescription(label);
        if (computedTitle) {
          switch (computedTitle) {
            case "Transmitting data to compute environment":
              return (
                <>
                  <CloudUploadAltIcon />
                  <span>Transmitting Data</span>
                </>
              );
            case "Setting compute environment":
              return (
                <>
                  <DockerIcon />
                  <span>Setting Compute Environment</span>
                </>
              );

            case "Computing":
              return (
                <>
                  <ServicesIcon />
                  <span>Computing</span>
                </>
              );

            case "Syncing data from compute environment":
              return (
                <>
                  <MixcloudIcon />
                  <span>Syncing Data</span>
                </>
              );

            case "Finishing up":
              return (
                <>
                  <StorageDomainIcon />
                  <span>Finishing up</span>
                </>
              );
          }
        }
        return computedTitle;
      })
      .filter((title) => title !== undefined);
    return currentTitle[0];
  }

  getCommand(plugin: Plugin, params: PluginInstanceParameter[]) {
    const { dock_image, selfexec } = plugin.data;
    let command = `docker run -v $(pwd)/in:/incoming -v $(pwd)/out:/outgoing ${dock_image} ${selfexec}`;

    if (params.length) {
      command +=
        "\n" +
        params
          .map((param) => `--${param.data.param_name} ${param.data.value}`)
          .join("\n");
    }

    command = `${command}\n    /incoming /outgoing`.trim();

    // append backslashes
    const lines = command.split("\n");
    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b))
      .length;
    return lines
      .map((line) => `${line.padEnd(longest)}  \\`)
      .join("\n")
      .slice(0, -1); // remove final backslash
  }

  calculateTotalRuntime = () => {
    const { selected } = this.props;
    let runtime = 0;
    const start = new Date(selected.data.start_date);
    const end = new Date(selected.data.end_date);
    const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
    runtime += elapsed;

    // format millisecond amount into human-readable string
    let runtimeStrings = [];
    const timeParts = [
      ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
      ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
      ["min", Math.floor((runtime / 1000 / 60) % 60)],
      ["sec", Math.floor((runtime / 1000) % 60)],
    ];
    for (const part of timeParts) {
      const [name, value] = part;
      if (value > 0) {
        runtimeStrings.push(`${value} ${name}`);
      }
    }
    return runtimeStrings.join(", ");
  };

  render() {
    const { selected, pluginStatus } = this.props;
    const { params, plugin } = this.state;
    let runtime = this.calculateTotalRuntime();

    const pluginTitle = `${selected.data.plugin_name} v. ${selected.data.plugin_version}`;
    const command =
      plugin && params ? this.getCommand(plugin, params) : "Loading command...";

    const commandRows = command.split("\n").length;

    return (
      <React.Fragment>
        <div className="details-header-wrap">
          <div>
            Selected Node:
            <Title headingLevel="h2" size="xl">
              {pluginTitle}
            </Title>
          </div>
          <div>
            <TextCopyPopover
              text={command}
              headerContent={`Command for ${pluginTitle}`}
              subheaderContent="This plugin was run via the following command:"
              position={PopoverPosition.bottom}
              rows={commandRows}
              className="view-command-wrap"
              maxWidth="27rem"
            >
              <Button>
                <TerminalIcon />
                View Command
                <CaretDownIcon />
              </Button>
            </TextCopyPopover>
          </div>
        </div>

        <Grid className="node-details-grid">
          <GridItem span={2} className="title">
            Status
          </GridItem>
          {}
          <GridItem span={10} className="value">
            {selected.data.status === "waitingForPrevious" ? (
              <>
                <OutlinedClockIcon />
                <span>Waiting for Previous</span>
              </>
            ) : selected.data.status === "scheduled" ? (
              <>
                <InProgressIcon />
                <span>Scheduled</span>
              </>
            ) : selected.data.status === "registeringFiles" ? (
              <>
                <FileArchiveIcon />
                <span>Registering Files</span>
              </>
            ) : selected.data.status === "finishedWithError" ? (
              <>
                <ErrorCircleOIcon />
                <span>FinishedWithError</span>
              </>
            ) : selected.data.status === "finishedSuccessfully" ? (
              <>
                <CheckIcon />
                <span>FinishedSuccessfully</span>
              </>
            ) : pluginStatus ? (
              <div className="node-details-grid__title">
                <h3
                  className="node-details-grid__title-label"
                  style={{ color: "white" }}
                >
                  {this.getCurrentTitleFromStatus(pluginStatus)}
                </h3>
              </div>
            ) : (
              <>
                <OnRunningIcon />
                <span>Started</span>
              </>
            )}
          </GridItem>

          <GridItem span={2} className="title">
            Created
          </GridItem>
          <GridItem span={10} className="value">
            <CalendarDayIcon />
            <Moment format="DD MMM YYYY @ HH:mm">
              {selected.data.start_date}
            </Moment>
          </GridItem>

          <GridItem span={2} className="title">
            Node ID
          </GridItem>
          <GridItem span={10} className="value">
            {selected.data.id}
          </GridItem>
          {runtime && (
            <>
              <GridItem span={2} className="title">
                <FontAwesomeIcon icon={["far", "calendar-alt"]} />
                Total Runtime:
              </GridItem>
              <GridItem span={10} className="value">
                {runtime}
              </GridItem>
            </>
          )}
        </Grid>

        <br />
        <br />
      
        <div className="btn-div">
          <AddNode />
        </div>

        <br />
        <br />
        <label style={{ color: "white", fontWeight:'bold' }}>
          Plugin output may be viewed below.
        </label>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  pluginStatus: state.plugin.pluginStatus,
  pluginLog: state.plugin.pluginLog,
  isComputeError:state.plugin.computeError
});

export default connect(mapStateToProps, null)(NodeDetails);
