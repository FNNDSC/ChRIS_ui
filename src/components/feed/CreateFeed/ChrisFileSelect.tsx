import React, { useState, useEffect } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { connect } from "react-redux";
import { ChrisFile } from "./CreateFeed";
import { ApplicationState } from "../../../store/root/applicationState";
import { Feed } from "@fnndsc/chrisapi";
import { findWhere } from "./utils/utils";
//import { Tree } from "antd";
import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";

import Tree from "rc-tree";
import "rc-tree/assets/index.css";

interface IChrisFileSelect {
  files: ChrisFile[];
  handleFileAdd: (file: ChrisFile) => void;
  handleFileRemove: (file: ChrisFile) => void;
  feeds?: Feed["data"][];
}

const ChrisFileSelect: React.FC<IChrisFileSelect> = (props) => {
  const [tree, setTree] = useState<DataNode[]>(getEmptyTree());
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    /*
    const getFiles = async () => {
      let files = await getUploadedFiles();

      const filePaths = files.map((file, index) => {
        return {
          path: file.data.upload_path,
        };
      });
      let tree = buildTree(filePaths, "0");
      let arr = [tree];
      setTree(arr);
      console.log("Tree", tree);
      // setTree(tree);
    };

    getFiles();
    */
  }, []);

  const onCheck = () => {};

  const onLoad = (treeNode: EventDataNode): Promise<void> => {
    const { key, children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }

      setTimeout(() => {
        updateTreeData(tree, key, generateTreeNodes(treeNode));
        setTree(tree);
        resolve();
      }, 1000);
    });
  };

  console.log("TreeData", tree);

  return (
    <div style={{ height: 500 }}>
      <Tree
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
 */

function updateTreeData(
  treeData: DataNode[],
  currentKey: Key,
  child: Promise<DataNode[]>
) {
  child.then((child) => {
    const loop = (data: DataNode[]) => {
      data.forEach((item) => {
        if ((currentKey as string).indexOf(item.key as string) === 0) {
          if (item.children) {
            loop(item.children);
          } else {
            item.children = child;
          }
        }
      });
    };

    loop(treeData);
    setLeaf(treeData, currentKey);
  });
}

function setLeaf(treeData: DataNode[], curKey: Key) {
  const loopLeaf = (data: DataNode[]) => {
    data.forEach((item) => {
      if (
        (item.key as string).length > (curKey as string).length
          ? (item.key as string).indexOf(curKey as string) !== 0
          : (curKey as string).indexOf(item.key as string) !== 0
      ) {
        return;
      }
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
  let arr = [];
  const { key } = treeNode;

  const files = await getUploadedFiles();
  const filePaths = files.map((file, index) => {
    return {
      path: file.data.upload_path,
    };
  });
  const tree = buildTree(filePaths, key);
  arr.push(tree);
  return arr;
}

function buildTree(filePaths: any[], currentkey: Key) {
  const paths = filePaths.map((filePath: any) => {
    const parts = filePath.path.split("/").slice(1);
    return parts;
  });

  let tree = {
    title: "uploads",
    children: [],
    key: `${currentkey}-0`,
  };

  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];

    let currentLevel: DataNode[] = tree.children;
    let uniqueKey = tree.key;

    for (let j = 0; j < path.length; j++) {
      let part = path[j];

      let existingPath = findWhere(currentLevel, "title", part);

      if (existingPath) {
        console.log("ExistingPath", existingPath);
        currentLevel = existingPath.children;
        uniqueKey = `${existingPath.key}`;
      } else {
        let newPart = {
          title: part,
          key: `${uniqueKey}-${i}`,
          children: [],
        };
        currentLevel && currentLevel.push(newPart);
        currentLevel = newPart.children;
      }
    }
  }
  return tree;
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
