import ChrisAPIClient from "../../../../api/chrisapiclient";
import { EventDataNode } from "rc-tree/lib/interface";
import { DataBreadcrumb } from "../types";
import _ from "lodash";

export const getNewTreeData = (
  treeData: DataBreadcrumb[],
  curKey: string,
  child: DataBreadcrumb[]
) => {
  const loop = (data: DataBreadcrumb[]) => {
    data.forEach((item) => {
      if (
        curKey.indexOf(item.key as string) === 0 ||
        (item.key as string).indexOf(curKey) === 0
      ) {
        if (item.children) {
          loop(item.children);
        } else if (item.key === curKey) {
          item.children = child;
        }
      }
    });
  };
  loop(treeData);
};

const setLeaf = (treeData: DataBreadcrumb[]) => {
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
};

export const generateTreeNodes = async (
  treeNode: EventDataNode
): Promise<DataBreadcrumb[]> => {
  const key = treeNode.key;
  let arr = [];

  if (treeNode.title === "chris") {
    const feeds = await getFeeds();
    let breadcrumb = "chris";
    for (let i = 0; i < feeds.length; i += 1) {
      // First level is feeds and uploads
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
      buildTree(feedPaths, (tree) => {
        traverse(tree, treeNode.pos, breadcrumb);
        setLeaf(tree);
        arr = tree;
      });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("uploads") === 0) {
    let breadcrumb = treeNode.title.toString();
    const files = await getUploadedFiles();

    const filePaths = files.map((file) => file.data.fname.split("uploads")[1]);
    if (filePaths.length > 0)
      buildTree(filePaths, (tree) => {
        traverse(tree, treeNode.pos, breadcrumb);
        setLeaf(tree);
        arr = tree;
      });
  }
  return arr;
};

const traverse = (
  tree: DataBreadcrumb[],
  startIndex: string | number,
  breadcrumb: string
) => {
  _.each(tree, function (item, index) {
    item.key = `${startIndex}-${index}`;
    item.breadcrumb = `${breadcrumb}/${item.breadcrumb}`;
    if (item.children) traverse(item.children, item.key, item.breadcrumb);
  });
};

const getFeeds = async () => {
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
};

const getFeedFiles = async (id: number) => {
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
};

const getUploadedFiles = async () => {
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
};

const buildTree = (paths: string[], cb: (tree: any[]) => void) => {
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
};
