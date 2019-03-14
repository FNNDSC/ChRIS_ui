import React from "react";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import { ShareAltIcon, InfrastructureIcon } from "@patternfly/react-icons";
import TreeNodeModel, { INode } from "../../api/models/tree-node.model";
import PipelineTree from "./PipelineTree";
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
    const { selected, descendants } = this.props;
    return (
      <React.Fragment>
        <div className="capitalize">
          <label>Selected Node:</label> {selected.plugin_name}
        </div>
        <Grid>
          <GridItem className="pf-u-p-sm" sm={12} md={6}>
            <PipelineTree items={descendants} selected={selected} />
          </GridItem>
          <GridItem className="pf-u-p-sm" sm={12} md={6}>
            <label>From this node:</label>
            <div className="btn-div">
              <Button
                variant="tertiary"
                isBlock
                onClick={this.handleAddNewNode} >
                <InfrastructureIcon /> Add new node(s)...
              </Button>
              {
                this.isNodePipelineRoot(selected) && (
                  <Button variant="tertiary" isBlock onClick={this.handleSharePipeline}>
                    <ShareAltIcon /> Share this pipeline...
                  </Button>
                )
              }
            </div>
          </GridItem>
        </Grid>
      </React.Fragment>
    );
  }
}

export default NodeDetails;
