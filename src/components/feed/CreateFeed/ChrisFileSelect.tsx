import React, { useState, useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { connect } from "react-redux";
import { ChrisFile } from "./CreateFeed";
import { ApplicationState } from "../../../store/root/applicationState";
import { Feed } from "@fnndsc/chrisapi";

import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";

//import Tree from "rc-tree";
//import "rc-tree/assets/index.css";
import { Tree } from "antd";
import "antd/dist/antd.css";

import _ from "lodash";

interface IChrisFileSelect {
  files: ChrisFile[];
  handleFileAdd: (file: ChrisFile) => void;
  handleFileRemove: (file: ChrisFile) => void;
  feeds?: Feed["data"][];
}

function getEmptyTree() {
  let node: DataNode[] = [];
  node.push({
    title: "chris",
    key: "0-0",
  });
  return node;
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

  useEffect(() => {}, []);

  const onCheck = (
    checkedKeys:
      | {
          checked: Key[];
          halfChecked: Key[];
        }
      | Key[],
    info: {
      event: "check";
      node: EventDataNode;
      checked: boolean;
      nativeEvent: MouseEvent;
      checkedNodes: DataNode[];
      checkedNodesPositions?: {
        node: DataNode;
        pos: string;
      }[];
      halfCheckedKeys?: Key[];
    }
  ) => {
    setCheckedKeys(checkedKeys);
    console.log("CheckedKeys", checkedKeys, info);
  };

  const onLoad = (treeNode: EventDataNode): Promise<void> => {
    console.log("Load data.....");
    const { children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }

      setTimeout(() => {
        generateTreeNodes(treeNode).then((nodes) => {
          const treeData = [...tree];
          updateTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
        });

        resolve();
      }, 1000);
    });
  };

  return (
    <div style={{ height: 500 }}>
      <Tree
        onCheck={onCheck}
        loadData={onLoad}
        checkedKeys={checkedKeys}
        checkable
        treeData={tree}
        checkStrictly
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

function updateTreeData(
  treeData: DataNode[],
  currentKey: string,
  child: DataNode[]
) {
  const loop = (data: DataNode[]) => {
    console.log("Data,child", data, child);
    data.forEach((item) => {
      if (currentKey.indexOf(item.key as string) === 0) {
        if (item.children) {
          loop(item.children);
        } else {
          item.children = child;
        }
      }
    });
  };

  loop(treeData);
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
  const key = treeNode.pos;
  let arr = [];

  if (treeNode.title === "chris") {
    const feeds = await getFeeds();
    for (let i = 0; i < feeds.length; i += 1) {
      arr.push({ title: `feed_${1}`, key: `${key}-${i}` });
    }
    arr.push({ title: "uploads", key: `${key}-${feeds.length}` });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("feed") === 0) {
    const id = treeNode.title.toString().split("_")[1];
    const feedFiles = await getFeedFiles(parseInt(id));
    const feedPaths = feedFiles.map(
      (file) => file.data.fname.split(treeNode.title)[1]
    );
    buildTree(feedPaths, (tree) => {
      traverse(tree, treeNode.pos);
      setLeaf(tree);

      arr.push(tree[0]);
    });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("uploads") === 0) {
    const files = await getUploadedFiles();
    console.log("Files", files);
    const filePaths = files.map((file) => file.data.upload_path);

    buildTree(filePaths, (tree) => {
      traverse(tree, treeNode.pos);
      setLeaf(tree);

      for (let i = 0; i < tree.length; i++) {
        arr.push(tree[i]);
      }
    });
  }

  return arr;
}

function traverse(tree: DataNode[], startIndex: string) {
  _.each(tree, function (item, index) {
    item.key = `${startIndex}-${index}`;
    if (item.children) traverse(item.children, item.key);
  });
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

async function getFeedFiles(id: number) {
  const client = ChrisAPIClient.getClient();
  let params = {
    limit: 100,
    offset: 0,
  };

  let fileList = await (await client.getFeed(id)).getFiles(params);
  let feedFiles = fileList.getItems();

  while (fileList.hasNextPage) {
    try {
      params.offset += params.limit;
      fileList = await (await client.getFeed(id)).getFiles(params);
      feedFiles.push(...fileList.getItems());
    } catch (e) {
      console.error(e);
    }
  }
  return feedFiles;
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

function buildTree(paths: string[], cb: (tree: any[]) => void) {
  var tree: any[] = [];

  _.each(paths, function (path) {
    var pathParts = path.split("/");
    pathParts.shift();
    var currentLevel = tree;
    _.each(pathParts, function (part) {
      var existingPath = _.find(currentLevel, {
        title: part,
      });
      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        var newPart = {
          title: part,
          children: [],
        };
        currentLevel.push(newPart);
        currentLevel = newPart.children;
      }
    });
  });

  cb(tree);
}
