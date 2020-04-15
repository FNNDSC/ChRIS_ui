import React from "react";
import Moment from "react-moment";

import {
  Button,
  Grid,
  GridItem,
  Title,
  PopoverPosition,
} from "@patternfly/react-core";
import { Plugin, PluginInstanceParameter } from "@fnndsc/chrisapi";
import {
  ShareAltIcon,
  TerminalIcon,
  CaretDownIcon,
  CheckIcon,
  CalendarDayIcon,
} from "@patternfly/react-icons";

import {
  IPluginItem,
  statusLabels,
} from "../../api/models/pluginInstance.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import TreeNodeModel from "../../api/models/tree-node.model";

import TextCopyPopover from "../common/textcopypopover/TextCopyPopover";
import AddNode from "./AddNode/AddNode";

interface INodeProps {
  selected: IPluginItem;
  descendants: IPluginItem[];
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
    if (prevSelected.id !== selected.id) {
      this.fetchPluginData();
    }
  }

  async fetchPluginData() {
    const { id, plugin_id } = this.props.selected;

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
  isNodePipelineRoot(item: IPluginItem) {
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
          .map((param) => `    --${param.data.param_name} ${param.data.value}`)
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

  render() {
    const { selected } = this.props;
    const { plugin, params } = this.state;

    const pluginTitle = `${selected.plugin_name} v. ${selected.plugin_version}`;
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
            <CheckIcon />
            {statusLabels[selected.status] || selected.status}
          </GridItem>
          <GridItem span={2} className="title">
            Created
          </GridItem>
          <GridItem span={10} className="value">
            <CalendarDayIcon />
            <Moment format="DD MMM YYYY @ HH:mm">{selected.start_date}</Moment>
          </GridItem>
          <GridItem span={2} className="title">
            Node ID
          </GridItem>
          <GridItem span={10} className="value">
            {selected.id}
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

export default NodeDetails;
