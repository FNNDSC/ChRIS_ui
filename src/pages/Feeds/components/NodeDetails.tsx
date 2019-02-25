import React from "react";
import { IPluginItem } from "../../../store/feed/types";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import { ShareAltIcon, InfrastructureIcon } from "@patternfly/react-icons";
interface INodeProps {
  selected: IPluginItem;
}

class NodeDetails extends React.Component<INodeProps> {
  render() {
    const { selected } = this.props;
    return (
      <React.Fragment>
        <div>
          <label>Selected Node:</label> {selected.plugin_name}
        </div>
        <Grid>
          <GridItem className="pf-u-p-sm" sm={12} md={6}>
            Pipeline chart
          </GridItem>
          <GridItem className="pf-u-p-sm" sm={12} md={6}>

              <label>From this node:</label>
              <div className="btn-div">
                <Button variant="tertiary" isBlock>
                  <InfrastructureIcon /> Add new node(s)...
                </Button>
                <Button variant="tertiary" isBlock>
                  <ShareAltIcon /> Share this pipeline...
                </Button>
              </div>

          </GridItem>
        </Grid>
      </React.Fragment>
    );
  }
}

export default NodeDetails;
