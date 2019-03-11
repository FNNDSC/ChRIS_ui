import React, { useState } from "react";
import Tree from "react-ui-tree";
import { FolderIcon, FolderOpenIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer";
import "./file-explorer.scss";
import * as _ from "lodash";
type AllProps = {
  data: any[];
  onClickNode: (node: IUITreeNode) => void;
};

class FileExplorer extends React.Component< AllProps, { isActive: IUITreeNode } > {
  state = {
    isActive: tree // Description: Set up root node as default activ state
  };

  // Description: Render node and determine active node
  renderNode = (node: IUITreeNode) => {
    const isActive = _.isEqual(this.state.isActive, node);
    return (
      <span
        className={`${isActive && "active"} ${!!!node.leaf ? "folderNode" : "fileNode"}`}
        onClick={this.onClickHandler.bind(null, node)}  >
        <FolderOpenIcon color="#ffee99" />
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
  }
  handleChange = () => {
    return false;
  }
  render() {
    return (
      <div className="explorer-tree">
        <Tree
          paddingLeft={20} // left padding for children nodes in pixels
          tree={tree} // tree object
          onChange={this.handleChange} // onChange(tree) tree object changed
          renderNode={this.renderNode} // renderNode(node) return react element
          draggable={false} // not implemented in latest version
        />
      </div>
    );
  }
}


// Mock data ***** to be removed and replaced with real data
const tree: IUITreeNode = {
  module: "Output Dir",
  children: [
    {
      module: "Documents",
      collapsed: true,
      children: [
        {
          module: "node.js",
          leaf: true
        },
        {
          module: "react-ui-tree.css",
          leaf: true
        },
        {
          module: "react-ui-tree.js",
          leaf: true
        },
        {
          module: "tree.js",
          leaf: true
        }
      ]
    },
    {
      module: "Images",
      children: [
        {
          module: "app.js",
          leaf: true
        },
        {
          module: "app.less",
          leaf: true
        },
        {
          module: "index.html",
          leaf: true
        }
      ]
    },
    {
      module: "Videos",
      children: [
        {
          module: "node.js",
          leaf: true
        },
        {
          module: "react-ui-tree.js",
          leaf: true
        },
        {
          module: "react-ui-tree.less",
          leaf: true
        },
        {
          module: "tree.js",
          leaf: true
        }
      ]
    },
    {
      module: "Others"
    }
  ]
};

export default React.memo(FileExplorer);
