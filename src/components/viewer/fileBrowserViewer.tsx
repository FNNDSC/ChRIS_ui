import * as React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IUITreeNode } from "../../api/models/file-explorer";
import FileExplorer from "../explorer/FileExplorer";
import FileDetailView from "../explorer/FileDetailView";

type AllProps = {
  files: IFeedFile[];
  explorer: IUITreeNode;
};

const FileBrowserViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  console.log("FileBrowserViewer", props.files);
  // Description: handle active node and render FileDetailView ***** working
  const setActiveNode = (node: any) => {
    /// TO BE DONE
  };

  return (
    <div className="pf-u-px-lg">
      <Grid>
        <GridItem className="pf-u-p-sm" sm={12} md={3}>
          {/* Left nav - file explorer tree: */}
          <FileExplorer data={props.files} onClickNode={setActiveNode} />
        </GridItem>
        <GridItem className="pf-u-p-sm" sm={12} md={9}>
          {/* Right container - display file table: */}
          <FileDetailView data={props.files} />
        </GridItem>
      </Grid>
    </div>
  );
};

export default React.memo(FileBrowserViewer);
