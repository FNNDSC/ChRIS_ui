import React, { useState } from "react";
import Tree from "react-ui-tree";
import { FolderIcon, FolderOpenIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer";
import "./file-explorer.scss";
import * as _ from "lodash";
type AllProps = {
  data: any[];
};

const FileExplorer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const handleChange = () => {
    return true;
  };
  // Set local state hook ***** working
  const [isActive, setActiveState] = useState({ module: "" }); // TEMP ***** set to false
  const renderNode = (node: IUITreeNode) => {
    const activeClass = !!node.children && !node.collapsed && "active"; // TEMP ***** need to set active class dynamically
    const nodeClass = !!!node.leaf ? "folderNode" : "fileNode";
    return (
      <span
        className={`${activeClass} ${nodeClass}`}
        onClick={onClickNode.bind(null, node)}
      >
        <FolderOpenIcon color="#ffee99" />
        {node.module}
      </span>
    );
  };

  const onClickNode = (node: IUITreeNode) => {
    setActiveState(node);
  };

  return (
    <div className="explorer-tree">
      <p>You clicked {isActive.module} times</p>
      <Tree
        paddingLeft={20} // left padding for children nodes in pixels
        tree={tree} // tree object
        onChange={handleChange} // onChange(tree) tree object changed
        renderNode={renderNode} // renderNode(node) return react element
      />
    </div>
  );
};

// Mock data ***** to be removed and replaced with real data
const tree = {
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
