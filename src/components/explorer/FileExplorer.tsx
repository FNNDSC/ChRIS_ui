import React from "react";
import Tree from "react-ui-tree";
import { OutlinedFileAltIcon, FolderIcon, FolderOpenIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer";
import "./file-explorer.scss";
import _ from "lodash";
type AllProps = {
  explorer: IUITreeNode;
  onClickNode: (node: IUITreeNode) => void;
};

class FileExplorer extends React.Component< AllProps,{ isActive: IUITreeNode } > {
  state = {
    isActive: this.props.explorer // Description: Set up root node as default activ state
  };

  // Description: Render node and determine active node
  renderNode = (node: IUITreeNode) => {
    const isActive = _.isEqual(this.state.isActive, node);
    const isFolder = !!!node.leaf;
    const isCollapsed = !!!node.collapsed;
    return (
      <span
        className={`${isActive && "active"} ${isFolder ? "folderNode" : "fileNode"}`}
        onClick={this.onClickHandler.bind(null, node)}  >
        {isFolder ? (!!!isCollapsed ? <FolderIcon color="#ffee99" /> : <FolderOpenIcon color="#ffee99" /> ) : (<OutlinedFileAltIcon />)}
        {node.module}
      </span>
    );
  }

  // Description: Set local state and pass new data up to parent
  onClickHandler = (node: IUITreeNode) => {
    this.setState({
      isActive: node
    });
    this.props.onClickNode(node);
    return false;
  }

  render() {
    const {explorer} = this.props;
    return (
      <div className="explorer-tree">
        <Tree
          paddingLeft={20}
          tree={explorer}
          renderNode={this.renderNode} // renderNode(node) return react element
          draggable={false} // not implemented in latest version
        />
      </div>
    );
  }
}

export default React.memo(FileExplorer);
