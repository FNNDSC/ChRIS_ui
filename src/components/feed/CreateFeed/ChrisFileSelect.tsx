import React, { useState, useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { connect } from "react-redux";
import { ChrisFile } from "./CreateFeed";
import { ApplicationState } from "../../../store/root/applicationState";
import { Feed } from "@fnndsc/chrisapi";
import { findWhere } from "./utils/utils";
import { Tree } from "antd";
import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";
import "antd/dist/antd.css";
import { uuid } from "uuidv4";

interface IChrisFileSelect {
  files: ChrisFile[];
  handleFileAdd: (file: ChrisFile) => void;
  handleFileRemove: (file: ChrisFile) => void;
  feeds?: Feed["data"][];
}

const ChrisFileSelect: React.FC<IChrisFileSelect> = ({ feeds }) => {
  const [tree, setTree] = useState<DataNode[]>(getEmptyTree());
  const [checkedKeys, setCheckedKeys] = useState<
    | {
        checked: Key[];
        halfChecked: Key[];
      }
    | Key[]
  >([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>();

  useEffect(() => {}, []);

  const onCheck = (
    checkedKeys:
      | {
          checked: Key[];
          halfChecked: Key[];
        }
      | Key[]
  ) => {
    setCheckedKeys(checkedKeys);
  };

  const onLoad = (treeNode: EventDataNode): Promise<void> => {
    const { key, children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }

      setTimeout(() => {
        generateTreeNodes(treeNode).then((nodes) => {
          setTree((origin) => {
            const tree = updateTreeData(nodes);
            console.log("tree", tree);
            return tree;
          });
        });

        resolve();
      }, 1000);
    });
  };

  const onExpand = (expandedKeys: Key[]) => {
    console.log("ExpandedKeys", expandedKeys);
    setExpandedKeys(expandedKeys);
  };
  return (
    <div style={{ height: 500 }}>
      <Tree
        onExpand={onExpand}
        onCheck={onCheck}
        loadData={onLoad}
        checkedKeys={checkedKeys}
        checkable
        treeData={tree}
      />
    </div>
  );
};

const mapStateToProps = ({ feed }: ApplicationState) => ({
  feeds: feed.feeds,
  uploadedFiles: feed.uploadedFiles,
});

export default connect(mapStateToProps, null)(ChrisFileSelect);

/**
 *
 *
 * utility functions to be abstracted out once this works
 *
 */

// It's just a simple demo. You can use tree map to optimize update perf.

function updateTreeData(children: DataNode[]): DataNode[] {
  const tree = children.map((node) => {
    return node;
  });
  setLeaf(tree);
  return tree;
}

function setLeaf(treeData: DataNode[]) {
  const loopLeaf = (data: DataNode[]) => {
    data.forEach((item) => {
      if (item.children && item.children.length > 0) {
        loopLeaf(item.children);
      } else {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData);
}

async function generateTreeNodes(treeNode: EventDataNode): Promise<DataNode[]> {
  console.log("TreeNode", treeNode);
  let arr = [];
  const feeds = await getFeeds();
  const feedPaths = feeds.map((feed) => {
    return {
      path: `feed_${feed.data.id}`,
    };
  });

  const files = await getUploadedFiles();
  const filePaths = files.map((file, index) => {
    return {
      path: file.data.upload_path,
    };
  });
  const paths = [...feedPaths, ...filePaths];
  buildTree(paths, treeNode);
  arr.push(treeNode);
  return arr;
}

function buildTree(filePaths: any[], treeNode: EventDataNode) {
  const paths = filePaths.map((filePath: any) => {
    const parts = filePath.path.split("/");
    return parts;
  });

  treeNode.children = [];

  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];

    let currentLevel: DataNode[] = treeNode.children;

    for (let j = 0; j < path.length; j++) {
      let part = path[j];

      let existingPath = findWhere(currentLevel, "title", part);

      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        let newPart = {
          title: part,
          key: uuid(),
          children: [],
        };
        currentLevel && currentLevel.push(newPart);
        currentLevel = newPart.children;
      }
    }
  }
}

async function getFeeds() {
  let params = {
    limit: 100,
    offset: 0,
  };
  let feeds = [];
  try {
    const client = ChrisAPIClient.getClient();
    feeds = (await client.getFeeds(params)).getItems();
  } catch (error) {
    console.error(error);
  }
  return feeds;
}

async function getUploadedFiles() {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 100,
    offset: 0,
  };

  let fileList = await client.getUploadedFiles(params);
  let files = fileList.getItems();

  while (fileList.hasNextPage) {
    try {
      params.offset += params.limit;
      fileList = await client.getUploadedFiles(params);
      files.push(...fileList.getItems());
    } catch (e) {
      console.error(e);
    }
  }

  return files;
}

function getEmptyTree() {
  let node: DataNode[] = [];
  node.push({
    title: "chris",
    key: "0",
  });
  return node;
}
