import React from "react";
import Tree from "react-ui-tree";
import { OutlinedFileAltIcon, FolderIcon, FolderOpenIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import "./file-explorer.scss";
import _ from "lodash";
type AllProps = {
  explorer: IUITreeNode;
  selectedNode?: IUITreeNode;
  onClickNode: (node: IUITreeNode) => void;
};

class FileExplorer extends React.Component<AllProps> {
  // Description: Render node and determine active node
  renderNode = (node: IUITreeNode) => {
    const { selectedNode } = this.props;
    const isActive = _.isEqual(selectedNode, node);
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
    this.props.onClickNode(node);
  }

  componentDidMount() {
    this._cancelNodeDraggables();
  }

  render() {
    const {explorer} = this.props;
    return (
      <div className="explorer-tree">
        <Tree
          paddingLeft={20}
          tree={explorer}
          renderNode={this.renderNode} // renderNode(node) return react element
        />
      </div>
    );
  }

  // Desciption and Notes: function finds all nodes and disables the draggable function that comes with the react-ui-tree
  // ***** To be develop: A full tree component that doesn't include draggable as default or make it optional
  _cancelNodeDraggables() {
    const arr = document.getElementsByClassName("m-node");
    !!arr && Array.prototype.forEach.call(arr, (el: Element) => {
      el.addEventListener("mousedown", (e: any) => { _inactivateMousedown(e); }, { passive: false });
    });
    const _inactivateMousedown = (e: MouseEvent) => {
      e.stopPropagation();
    };
  }
}

export default React.memo(FileExplorer);
