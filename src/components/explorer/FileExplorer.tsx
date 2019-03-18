import React from "react";
import Tree from "react-ui-tree";
import { OutlinedFileAltIcon, FolderIcon, FolderOpenIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer";
import "./file-explorer.scss";
import * as _ from "lodash";
type AllProps = {
  data: any[];
  onClickNode: (node: IUITreeNode) => void;
};

class FileExplorer extends React.Component<
  AllProps,
  { isActive: IUITreeNode }
> {
  state = {
    isActive: tree // Description: Set up root node as default activ state
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
    return (
      <div className="explorer-tree">
        <Tree
          paddingLeft={20}
          tree={tree}
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
        },
        {
          module: "inner folder",
          collapsed: true,
          children: [
            {
              module: "child1.txt",
              leaf: true
            },
            {
              module: "child2.txt",
              leaf: true
            },
            {
              module: "child3.txt",
              leaf: true
            },
            {
              module: "child4.txt",
              leaf: true
            },
            {
              module: "child5.txt",
              leaf: true
            },
            {
              module: "inner folder 2",
              collapsed: true,
              children: [
                {
                  module: "child1.txt",
                  leaf: true
                },
                {
                  module: "child2.txt",
                  leaf: true
                },
                {
                  module: "child3.txt",
                  leaf: true
                },
                {
                  module: "child4.txt",
                  leaf: true
                },
                {
                  module: "child5.txt",
                  leaf: true
                }
              ]
            }
          ]
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
