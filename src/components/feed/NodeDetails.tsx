import React from "react";
import Moment from "react-moment";

import { Button, Grid, GridItem, Title } from "@patternfly/react-core";
import { ShareAltIcon, InfrastructureIcon, TerminalIcon, CaretDownIcon, CheckIcon, CalendarDayIcon } from "@patternfly/react-icons";
import { PopoverPosition } from "@patternfly/react-core-updated";

import { IPluginItem, statusLabels } from "../../api/models/pluginInstance.model";
import TreeNodeModel from "../../api/models/tree-node.model";
import { getPluginInstanceTitle } from "../../api/models/pluginInstance.model";

import TextCopyPopover from "../common/textcopypopover/TextCopyPopover";

interface INodeProps {
  selected: IPluginItem;
  descendants: IPluginItem[];
}

class NodeDetails extends React.Component<INodeProps> {
  // Description: Share pipeline with others ***** Working
  handleSharePipeline() {
    // Stub - To be done 
  }

  // Description: Add new node to the feed ***** Working
  handleAddNewNode() {
    // Stub - To be done
  }

  // Description: root node or leaf nodes in the graph will not have the 'share this pipeline' button
  // Find out from descendants if this node is a leaf or root node
  isNodePipelineRoot(item: IPluginItem ) {
    const { descendants } = this.props;
    return (!TreeNodeModel.isRootNode(item) && !TreeNodeModel.isLeafNode(item, descendants));
  }

  render() {
    const { selected } = this.props;
    
    const pluginTitle = `${getPluginInstanceTitle(selected)} v. ${selected.plugin_version}`;
    const command = `
      docker run -v $(pwd)/in:/incoming -v
      $(pwd)/out:outgoing
      fnndsc/pl-antsreg antsreg.py
      /incoming /outgoing
    `;

    return (
      <React.Fragment>

        <div className="header-wrap">
          <div>
            Selected Node:
            <Title headingLevel="h2" size="xl">
              { pluginTitle }
            </Title>
          </div>
          <div>
            <TextCopyPopover
              text={command.trim()}
              headerContent={`Command for ${pluginTitle}`}
              subheaderContent="This plugin was run via the following command:"
              position={ PopoverPosition.bottom }
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

        <Grid gutter="sm" className="node-details-grid">
          <GridItem span={2} className="title">Status</GridItem>
          <GridItem span={10} className="value">
            <CheckIcon />
            { statusLabels[selected.status] || selected.status }
          </GridItem>
          <GridItem span={2} className="title">Created</GridItem>
          <GridItem span={10} className="value">
            <CalendarDayIcon />
            <Moment format="DD MMM YYYY @ HH:mm">
              {selected.start_date}
            </Moment>
          </GridItem>
          <GridItem span={2} className="title">Node ID</GridItem>
          <GridItem span={10} className="value">{ selected.id }</GridItem>
        </Grid>

        <br /><br />
        <label>Actions:</label>
        <div className="btn-div">
          <Button
            variant="tertiary"
            isBlock
            onClick={this.handleAddNewNode}
          >
            <InfrastructureIcon />
            Add new node(s)...
          </Button>
          {
            this.isNodePipelineRoot(selected) && (
              <Button variant="tertiary" isBlock onClick={this.handleSharePipeline}>
                <ShareAltIcon /> Share this pipeline...
              </Button>
            )
          }
        </div>

        <br /><br />
        <label>Plugin output may be viewed below.</label>

      </React.Fragment>
    );
  }
}

export default NodeDetails;