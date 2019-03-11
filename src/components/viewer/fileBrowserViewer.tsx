import * as React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import FileExplorer from "../explorer/FileExplorer";
import FileDetailView from "../explorer/FileDetailView";
type AllProps = {
  data: any[];
};

const FileBrowserViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <div className="pf-u-px-lg">
      <Grid>
        <GridItem className="pf-u-p-sm" sm={12} md={3}>
          {/* Left nav - file explorer tree: */}
          <FileExplorer data={props.data}  />
        </GridItem>
        <GridItem className="pf-u-p-sm" sm={12} md={9}>
          {/* Right container - display file table: */}
          <FileDetailView data={props.data}  />
        </GridItem>
      </Grid>
    </div>
  );
};

export default React.memo(FileBrowserViewer);
