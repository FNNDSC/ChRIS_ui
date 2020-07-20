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
  Spinner,
} from "@patternfly/react-core";
import { Plugin, PluginInstanceParameter } from "@fnndsc/chrisapi";
import {
  ShareAltIcon,
  TerminalIcon,
  CaretDownIcon,
  CalendarDayIcon,
  CheckIcon,
} from "@patternfly/react-icons";

import { PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";
import TreeNodeModel from "../../../api/models/tree-node.model";
import TextCopyPopover from "../../common/textcopypopover/TextCopyPopover";
import AddNode from "../AddNode/AddNode";
import Stepper, { StepInterface } from "./Stepper";

import { PluginStatusLabels } from "../FeedOutputBrowser/PluginStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface INodeProps {
  selected: PluginInstance;
  descendants: PluginInstance[];
  pluginStatus?: string;
}

interface INodeState {
  plugin?: Plugin; // the plugin which the currently selected instance is an instance of
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
    const { id, plugin_id } = this.props.selected.data;

    const client = ChrisAPIClient.getClient();
    const plugin = await client.getPlugin(plugin_id);

    const params = await (
      await client.getPluginInstance(id as number)
    ).getParameters();

    this.setState({
      plugin,
      params: params.getItems(),
    });
  }

  // Description: Share pipeline with others ***** Working
  handleSharePipeline() {
    // Stub - To be done
  }

  // Description: root node or leaf nodes in the graph will not have the 'share this pipeline' button
  // Find out from descendants if this node is a leaf or root node
  isNodePipelineRoot(item: PluginInstance) {
    const { descendants } = this.props;
    return (
      !TreeNodeModel.isRootNode(item) &&
      !TreeNodeModel.isLeafNode(item, descendants)
    );
  }

  getCommand(plugin: Plugin, params: PluginInstanceParameter[]) {
    const { dock_image, selfexec } = plugin.data;
    let command = `
    docker run -v $(pwd)/in:/incoming -v 
    $(pwd)/out:/outgoing
    ${dock_image} ${selfexec}`;

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

  getCurrentTitle(statusLabels: PluginStatusLabels) {
    if (statusLabels.pushPath.status !== true) {
      return "Transmitting Data";
    } else if (statusLabels.compute.submit.status !== true) {
      return "Setting Compute Enviornment";
    } else if (statusLabels.compute.return.status !== true) {
      return "Computing";
    } else if (statusLabels.pullPath.status !== true) {
      return "Syncing Data";
    } else if (statusLabels.swiftPut.status !== true) {
      return "Finishing up";
    } else {
      return (
        <>
          <CheckIcon />
          <span>Finished Successfully</span>
        </>
      );
    }
  }

  render() {
    const { selected, pluginStatus } = this.props;
    const { plugin, params } = this.state;
    let runtime = this.calculateTotalRuntime();

    const pluginStatusLabels: PluginStatusLabels =
      pluginStatus && JSON.parse(pluginStatus);

    let label: StepInterface[] = [];
    if (pluginStatusLabels) {
      label = [
        {
          id: 0,
          title: "Send Data",
          completed: pluginStatusLabels.pushPath.status === true,
        },
        {
          id: 1,
          title: "Submit Job",
          completed: pluginStatusLabels.compute.submit.status === true,
        },
        {
          id: 2,
          title: "Execute Job",
          completed: pluginStatusLabels.compute.return.status === true,
        },
        {
          id: 3,
          title: "Pull Results",
          completed: pluginStatusLabels.pullPath.status === true,
        },

        {
          id: 4,
          title: "Register Results",
          completed: pluginStatusLabels.swiftPut.status === true,
        },
      ];
    }

    const handleClick = () => {
      console.log("To be written");
    };

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
          <GridItem span={10} className="value">
            {pluginStatusLabels ? (
              <div className="node-details-grid__title">
                <h3
                  className="node-details-grid__title-label"
                  style={{ color: "white" }}
                >
                  {this.getCurrentTitle(pluginStatusLabels)}
                </h3>
              </div>
            ) : (
              "Started"
            )}
          </GridItem>

          <GridItem span={2}></GridItem>
          <GridItem span={10}>
            {label.length > 0 ? (
              <Stepper onClick={handleClick} steps={label} />
            ) : (
              <Spinner size="md" />
            )}
          </GridItem>
          <GridItem span={2} className="title"></GridItem>
          <GridItem span={10} className="value"></GridItem>
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
          <GridItem span={2} className="title">
            <FontAwesomeIcon icon={["far", "calendar-alt"]} />
            Total Runtime:
          </GridItem>
          <GridItem span={10} className="value">
            {runtime}
          </GridItem>
        </Grid>

        <br />
        <br />
        <label>Actions:</label>
        <div className="btn-div">
          <AddNode />
          {this.isNodePipelineRoot(selected) && (
            <Button
              variant="tertiary"
              isBlock
              onClick={this.handleSharePipeline}
            >
              <ShareAltIcon /> Share this pipeline...
            </Button>
          )}
        </div>

        <br />
        <br />
        <label>Plugin output may be viewed below.</label>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  pluginStatus: state.plugin.pluginStatus,
});

export default connect(mapStateToProps, null)(NodeDetails);
