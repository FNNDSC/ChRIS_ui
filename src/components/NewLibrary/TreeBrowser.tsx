import { Tree } from "antd";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import { useMemo, useState } from "react";
import type { CheckedKeys, DataBreadcrumb } from "../CreateFeed/types/feed";
import { getNewTreeData, generateTreeNodes } from "../CreateFeed/utils";
const { DirectoryTree } = Tree;

function getEmptyTree() {
  const node: DataBreadcrumb[] = [];

  node.push({
    breadcrumb: "/",
    title: "root",
    checkable: false,
    key: "0-0",
  });

  return node;
}

const TreeBrowser = () => {
  const [tree, setTree] = useState(getEmptyTree);
  const [checkedKeys, setCheckedKeys] = useState({});
  const fetchKeysFromDict: Key[] = useMemo(
    () => getCheckedKeys(checkedKeys),
    [checkedKeys],
  );

  const onCheck = (checkedKeys: CheckedKeys) => {
    setCheckedKeys(checkedKeys);
  };

  const onLoad = (treeNode: EventDataNode<any>): Promise<void> => {
    const { children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      generateTreeNodes(treeNode)
        .then((nodes) => {
          const treeData = [...tree];
          if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
          resolve();
        })
        .catch((err) => {
          console.log("Error", err);
          //setLoadingError(err);
          resolve();
        });
    });
  };

  return (
    <DirectoryTree
      onCheck={onCheck}
      loadData={onLoad}
      checkedKeys={fetchKeysFromDict}
      checkable
      treeData={tree}
    />
  );
};

export default TreeBrowser;

function getCheckedKeys(checkedKeys: { [key: string]: Key[] }) {
  const checkedKeysArray: Key[] = [];

  for (const i in checkedKeys) {
    checkedKeysArray.push(...checkedKeys[i]);
  }

  return checkedKeysArray;
}
