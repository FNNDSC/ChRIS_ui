import React, {useState} from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IUITreeNode } from "../../api/models/file-explorer";
import FileExplorer from "../explorer/FileExplorer";
import FileTableView from "../explorer/FileTableView";

type AllProps = {
  files: IFeedFile[];
  explorer: IUITreeNode;
};

const FileBrowserViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const [activeNode, setActiveNodeState] = useState(props.explorer); // Temp - set to false

  // Description: handle active node and render FileDetailView ***** working
  const setActiveNode = (node: IUITreeNode) => {
    setActiveNodeState(node);
  };

  return (
    <div className="pf-u-px-lg">
      <Grid>
        <GridItem className="pf-u-p-sm" sm={12} md={3}>
          {/* Left nav - file explorer tree: */}
          <FileExplorer
            explorer={props.explorer}
            active={activeNode}
            onClickNode={setActiveNode}  />
        </GridItem>
        <GridItem className="pf-u-p-sm" sm={12} md={9}>
          {/* Right container - display file table: */}
          <FileTableView active={activeNode} onClickNode={setActiveNode}  />
        </GridItem>
      </Grid>
    </div>
  );
};

export default React.memo(FileBrowserViewer);
