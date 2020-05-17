import React, { useState } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { connect } from "react-redux";

import { ApplicationState } from "../../../store/root/applicationState";
import { Feed } from "@fnndsc/chrisapi";
import { Split, SplitItem } from "@patternfly/react-core";

import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";
import { FolderCloseIcon, FileIcon, CloseIcon } from "@patternfly/react-icons";

import { Tree } from "antd";

import "antd/dist/antd.css";

//import { getNewTreeData } from "rc-tree/es/";

import _ from "lodash";

interface IChrisFileSelect {
  files: EventNode[];
  handleFileAdd: (file: EventNode, filePath: string) => void;
  handleFileRemove: (file: EventNode) => void;
  feeds?: Feed["data"][];
}

type Breadcrumb = {
  breadcrumb?: string;
};
export type EventNode = EventDataNode & Breadcrumb;
type DataBreadcrumb = DataNode & Breadcrumb;

function getEmptyTree() {
  let node: DataBreadcrumb[] = [];
  node.push({
    breadcrumb: "chris",
    title: "chris",
    key: "0-0",
  });
  return node;
}

const ChrisFileSelect: React.FC<IChrisFileSelect> = ({
  handleFileAdd,
  handleFileRemove,
  files,
}) => {
  const [tree, setTree] = useState<DataBreadcrumb[]>(getEmptyTree());
  const [checkedKeys, setCheckedKeys] = useState<
    | {
        checked: Key[];
        halfChecked: Key[];
      }
    | Key[]
  >([]);

  const onCheck = (
    checkedKeys:
      | {
          checked: Key[];
          halfChecked: Key[];
        }
      | Key[],
    info: {
      event: "check";
      node: EventNode;
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
    console.log("Info", info);

    if (info.node.breadcrumb) {
      let path = `chris/${info.node.breadcrumb}`;

      if (info.checked === true) handleFileAdd(info.node, path);
      else handleFileRemove(info.node);
    }
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
          getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
        });

        resolve();
      }, 1000);
    });
  };

  const fileList = files.map((file: EventNode, index) => {
    const isFolder = file.children && file.children.length > 0;
    const icon = isFolder ? <FolderCloseIcon /> : <FileIcon />;

    return (
      <div className="File-preview" key={index}>
        {icon}
        <span className="file-name">{file.title}</span>
        <CloseIcon
          className="file-remove"
          onClick={() => handleFileRemove(file)}
        />
      </div>
    );
  });

  return (
    <div className="chris-file-select">
      <h1 className="pf-c-title pf-m-2xl">
        Data Configuration: ChRIS File Select
      </h1>
      <p>Please choose the data files you'd like to add to your feed.</p>
      <br />
      <Split gutter="lg">
        <SplitItem isFilled>
          <Tree
            onCheck={onCheck}
            loadData={onLoad}
            checkedKeys={checkedKeys}
            checkable
            treeData={tree}
            checkStrictly
          />
        </SplitItem>
        <SplitItem isFilled className="file-list-wrap">
          <p className="section-header">Files to add to new feed:</p>
          <div className="file-list">{fileList}</div>
        </SplitItem>
      </Split>
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

function getNewTreeData(
  treeData: DataBreadcrumb[],
  curKey: string,
  child: DataBreadcrumb[]
) {
  console.log("CurKey", curKey);
  const loop = (data: DataBreadcrumb[]) => {
    data.forEach((item) => {
      if (curKey.indexOf(item.key as string) === 0) {
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

function setLeaf(treeData: DataBreadcrumb[]) {
  const loopLeaf = (data: DataBreadcrumb[]) => {
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

async function generateTreeNodes(
  treeNode: EventDataNode
): Promise<DataBreadcrumb[]> {
  const key = treeNode.key;
  let arr = [];

  if (treeNode.title === "chris") {
    const feeds = await getFeeds();
    let breadcrumb = "chris";
    for (let i = 0; i < feeds.length; i += 1) {
      arr.push({
        breadcrumb: `${breadcrumb}/feed_${i + 1}`,
        title: `feed_${i + 1}`,
        key: `${key}-${i}`,
      });
    }
    arr.push({
      breadcrumb: `${breadcrumb}/uploads`,
      title: "uploads",
      key: `${key}-${feeds.length}`,
    });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("feed") === 0) {
    let breadcrumb = treeNode.title.toString();
    const id = treeNode.title.toString().split("_")[1];
    const feedFiles = await getFeedFiles(parseInt(id));
    const feedPaths = feedFiles.map(
      (file) => file.data.fname.split(treeNode.title)[1]
    );
    if (feedPaths.length > 0)
      buildTree(feedPaths, breadcrumb, (tree) => {
        traverse(tree, treeNode.pos, breadcrumb);
        setLeaf(tree);
        arr.push(tree[0]);
      });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("uploads") === 0) {
    let breadcrumb = treeNode.title.toString();
    const files = await getUploadedFiles();

    const filePaths = files.map((file) => file.data.upload_path);

    if (filePaths.length > 0)
      buildTree(filePaths, breadcrumb, (tree) => {
        traverse(tree, treeNode.pos, breadcrumb);
        setLeaf(tree);
        console.log("Tree", tree);
        arr = tree;
      });
  }

  return arr;
}

function traverse(
  tree: DataBreadcrumb[],
  startIndex: string | number,
  breadcrumb: string
) {
  _.each(tree, function (item, index) {
    item.key = `${startIndex}-${index}`;
    item.breadcrumb = `${breadcrumb}/${item.breadcrumb}`;
    if (item.children) traverse(item.children, item.key, item.breadcrumb);
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

function buildTree(
  paths: string[],
  breadcrumb: string,
  cb: (tree: any[]) => void
) {
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
          breadcrumb: part,
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
