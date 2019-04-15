import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Grid, GridItem } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setExplorerRequest, setSelectedNode } from "../../../store/explorer/actions";
import { IExplorerState } from "../../../store/explorer/types";
import { IFeedFile } from "../../../api/models/feed-file.model";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import { IUITreeNode } from "../../../api/models/file-explorer";
import FileExplorer from "../../explorer/FileExplorer";
import FileTableView from "../../explorer/FileTableView";


interface IPropsFromDispatch {
  setExplorerRequest: typeof setExplorerRequest;
  setSelectedNode: typeof setSelectedNode;
}

type AllProps = {
  files: IFeedFile[];
  selected: IPluginItem;
} & IExplorerState & IPropsFromDispatch;


class FileBrowserViewer extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    const { files, selected, setExplorerRequest } = this.props;
    setExplorerRequest(files, selected);
  }

  // Description: handle active node and render FileDetailView
  setActiveNode = (node: IUITreeNode) => {
    const { selectedNode, setSelectedNode } = this.props;
    (node !== selectedNode) && setSelectedNode(node);
  };

  render() {
    const { explorer, selectedNode } = this.props;
    return (
      !!explorer &&
      <div className="pf-u-px-lg">
        <Grid>
          <GridItem className="pf-u-p-sm" sm={12} md={3}>
            {<FileExplorer
              explorer={explorer}
              selectedNode={selectedNode}
              onClickNode={this.setActiveNode} />}
          </GridItem>
          <GridItem className="pf-u-py-sm pf-u-px-xl" sm={12} md={9}>
            {
              !!selectedNode ?
                <FileTableView selectedNode={selectedNode} onClickNode={this.setActiveNode} /> :
                <div>Empty Message</div>
            }
          </GridItem>
        </Grid>
      </div>
    );
  }

};


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setExplorerRequest: (files: IFeedFile[], selected: IPluginItem) => dispatch(setExplorerRequest(files, selected)),
  setSelectedNode: (node: IUITreeNode) => dispatch(setSelectedNode(node))
});

const mapStateToProps = ({ explorer }: ApplicationState) => ({
  selectedNode: explorer.selectedNode,
  explorer: explorer.explorer
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileBrowserViewer);
