import React from "react";
import { Tree } from "antd";
import { EventDataNode } from "rc-tree/lib/interface";
import { DataBreadcrumb } from "../../feed/CreateFeed/types";
import { isEmpty } from "lodash";
import {
  generateTreeNodes,
  getNewTreeData,
} from "../../feed/CreateFeed/utils/fileSelect";

function getEmptyTree() {
  const node: DataBreadcrumb[] = [];
  node.push({
    breadcrumb: "test",
    title: "test",
    key: "0-0",
  });
  return node;
}

const cache: {
  tree: DataBreadcrumb[];
} = {
  tree: [],
};

function setCacheTree(tree: DataBreadcrumb[]) {
  cache["tree"] = tree;
}

function getCacheTree() {
  return cache["tree"];
}

export function clearCache() {
  cache["tree"] = [];
}

const SwiftFileBrowser: React.FC = () => {
  const [tree, setTree] = React.useState<DataBreadcrumb[]>(
    (!isEmpty(getCacheTree()) && getCacheTree()) || getEmptyTree()
  );

  const onLoad = (treeNode: EventDataNode): Promise<void> => {
    const { children } = treeNode;
    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      setTimeout(() => {
        generateTreeNodes(treeNode, "test").then((nodes) => {
          const treeData = [...tree];
          if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
          setCacheTree(treeData);
        });
      }, 1000);
    });
  };

  return <Tree loadData={onLoad} treeData={tree} />;
};

export default SwiftFileBrowser;
