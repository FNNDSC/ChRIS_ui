import React, { useState, useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { connect } from "react-redux";
import { ChrisFile } from "./CreateFeed";
import { ApplicationState } from "../../../store/root/applicationState";
import { Feed } from "@fnndsc/chrisapi";

import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";

import Tree from "rc-tree";
import "rc-tree/assets/index.css";
//import { Tree } from "antd";
//import "antd/dist/antd.css";
import { findWhere } from "./utils/utils";

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
          console.log("TreeData", treeData);
          setTree(treeData);
        });

        resolve();
      }, 1000);
    });
  };

  const onExpand = (expandedKeys: Key[]) => {
    console.log("ExpandedKeys", expandedKeys);
    setExpandedKeys(expandedKeys);
  };

  const onSelect = (
    selectedKeys: Key[],
    info: {
      event: "select";
      selected: boolean;
      node: EventDataNode;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    }
  ) => {};

  return (
    <div style={{ height: 500 }}>
      <Tree
        onExpand={onExpand}
        onSelect={onSelect}
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

function updateTreeData(
  treeData: DataNode[],
  currentKey: string,
  child: DataNode[]
) {
  const loop = (data: DataNode[]) => {
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
  //setLeaf(treeData);
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
  console.log(
    "TreeNode",
    treeNode.pos,
    treeNode.title && treeNode.title.toString()
  );
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
    console.log("Tree node feed?", treeNode.title);
    const id = treeNode.title.toString().split("_")[1];

    const pluginInstances = await getPluginInstancesForFeed(parseInt(id));
    for (let i = 0; i < pluginInstances.length; i++) {
      let title = `${pluginInstances[i].data.plugin_name}_${pluginInstances[i].data.id}`;
      arr.push({
        title,
        key: `${key}-${i}`,
      });
    }
  }

  if (treeNode.title && treeNode.title.toString().indexOf("uploads") === 0) {
    const files = await getUploadedFiles();
    const filePaths = files.map((file) => file.data.upload_path);
    const tree = buildTree(treeNode, filePaths);
    console.log("Tree", tree);

    //const uniquePaths = Array.from(new Set(filePaths));

    /*
    for (let i = 0; i < uniquePaths.length; i++) {
      arr.push({
        title: uniquePaths[i],
        key: `${key}-${i}`,
        children: [
          {
            title: "dicom",
            key: `${key}-0-0`,
          },
        ],
      });
    }
    */
  }

  /*
  const feedPaths = feeds.map((feed) => {
    return {
      path: `feed_${feed.data.id}`,
    };
  });
  */

  /*
  const files = await getUploadedFiles();
  const filePaths = files.map((file, index) => {
    return {
      path: file.data.upload_path,
    };
  });

  /*


  
  const paths = [...feedPaths, ...filePaths];
  buildTree(paths, treeNode);
  arr.push(treeNode);
  */
  return arr;
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

async function getPluginInstancesForFeed(id: number) {
  const client = ChrisAPIClient.getClient();

  const pluginInstanceList = await (
    await client.getFeed(id)
  ).getPluginInstances();
  return pluginInstanceList.getItems();
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

function buildTree(treeNode: EventDataNode, filePaths: any[]) {
  const paths = filePaths.map((filePath: any) => {
    const parts = filePath.split("/").slice(1);
    return parts;
  });
  let tree: DataNode = {
    title: treeNode.title,
    key: treeNode.key,
  };

  tree.children = [];

  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];

    let currentLevel = tree.children;
    let key = `${treeNode.key}-${i}`;
    let level = path.length;

    for (let j = 0; j < path.length; j++) {
      let part = path[j];
      console.log("Level", level);

      let existingPath = findWhere(currentLevel, "title", part);

      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        let newPart = {
          title: part,
          key: `${key}-${i}`,
          children: [],
        };

        currentLevel && currentLevel.push(newPart);
        level--;

        currentLevel = newPart.children;
      }
    }
  }
  return tree;
}
