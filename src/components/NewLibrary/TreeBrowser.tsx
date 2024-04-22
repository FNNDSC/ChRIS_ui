import { Tree } from "antd";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import { useMemo, useState } from "react";
import type {
  CheckedKeys,
  DataBreadcrumb,
  Info,
} from "../CreateFeed/types/feed";
import { getNewTreeData, generateTreeNodes } from "../CreateFeed/utils";
import styles from "./UploadFile.module.css";

const { DirectoryTree } = Tree;

function getEmptyTree() {
  const node: DataBreadcrumb[] = [];

  node.push({
    breadcrumb: "/",
    title: "/",
    checkable: false,
    key: "0-0",
  });

  return node;
}

const TreeBrowser = () => {
  const [tree, setTree] = useState(getEmptyTree);
  const [checkedKeys, setCheckedKeys] = useState({});

  const onCheck = (checkedKeys: CheckedKeys, info: Info) => {
    console.log("Info", info, checkedKeys);
    if (info.node.breadcrumb) {
      if (info.checked === true) {
        setCheckedKeys(checkedKeys);
      }
    }
  };

  console.log("Libary Page", checkedKeys);

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
    <div
      style={{
        marginTop: "1rem",
      }}
    >
      <DirectoryTree
        className={styles.antTree}
        onCheck={onCheck}
        loadData={onLoad}
        checkedKeys={checkedKeys}
        checkable
        treeData={tree}
      />
    </div>
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
