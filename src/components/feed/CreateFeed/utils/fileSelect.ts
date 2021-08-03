import ChrisAPIClient from "../../../../api/chrisapiclient";
import { EventDataNode } from "rc-tree/lib/interface";
import { DataBreadcrumb } from "../types";
import _ from "lodash";
import {
  FeedFile,
  UploadedFile,
  UploadedFileList,
  Feed,
} from "@fnndsc/chrisapi";
import { PACSFile } from "../types";
import { fetchResource } from "../../../../utils";

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
  treeNode: EventDataNode,
  username: string
): Promise<DataBreadcrumb[]> => {
  const key = treeNode.key;
  let arr = [];
  let feeds = [];
  const breadcrumb = username;

  if (treeNode.title === username) {
    // First level is feeds and uploads

    try {
      feeds = await getFeeds();
    } catch (error) {
      throw new Error(`${error}`);
    }

    for (let i = 0; i < feeds.length; i += 1) {
      const id = feeds[i].data.id;
      arr.push({
        breadcrumb: `${breadcrumb}/feed_${id}`,
        title: `feed_${id}`,
        key: `${key}-${i}`,
      });
    }

    arr.push({
      breadcrumb: `${breadcrumb}/uploads`,
      title: "uploads",
      key: `${key}-${feeds.length}`,
    });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("SERVICES") === 0) {
    arr.push({
      breadcrumb: `${treeNode.title.toString()}/PACS`,
      title: "PACS",
      key: `${treeNode.key}-0`,
    });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("feed") === 0) {
    const newBreadcrumb = `${breadcrumb}/${treeNode.title.toString()}`;
    const id = treeNode.title.toString().split("_")[1];
    const feedFiles = await getFeedFiles(parseInt(id));
    const feedPaths = feedFiles.map(
      (file) => file.data.fname.split(treeNode.title)[1]
    );
    if (feedPaths.length > 0)
      buildTree(feedPaths, (tree) => {
        traverse(tree, treeNode.pos, newBreadcrumb);
        setLeaf(tree);
        arr = tree;
      });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("uploads") === 0) {
    const newBreadcrumb = `${breadcrumb}/${treeNode.title.toString()}`;
    const files: UploadedFile[] = (await getFiles(
      "uploaded"
    )) as UploadedFile[];
    const filePaths = files.map((file) => file.data.fname.split("uploads")[1]);
    if (filePaths.length > 0)
      buildTree(filePaths, (tree) => {
        traverse(tree, treeNode.pos, newBreadcrumb);
        setLeaf(tree);
        arr = tree;
      });
  }

  if (treeNode.title && treeNode.title.toString().indexOf("PACS") === 0) {
    //@ts-ignore
    const newBreadcrumb = `${treeNode.breadcrumb}`;
    const files: PACSFile[] = (await getFiles("PACS")) as PACSFile[];
    const filePaths = files.map((file) => file.data.fname.split("PACS")[1]);
    if (filePaths.length > 0) {
      buildTree(filePaths, (tree) => {
        traverse(tree, treeNode.pos, newBreadcrumb);
        setLeaf(tree);
        arr = tree;
      });
    }
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
  const params = {
    limit: 20,
    offset: 0,
  };
  const client = ChrisAPIClient.getClient();
  const fn = client.getFeeds;
  const boundFn = fn.bind(client);
  try {
    const feeds = await fetchResource<Feed>(params, boundFn);
    return feeds;
  } catch (error) {
    throw new Error(`Error while fetching feeds, ${error}`);
  }
};

const getFeedFiles = async (id: number) => {
  const params = {
    limit: 100,
    offset: 0,
  };
  const client = ChrisAPIClient.getClient();
  let feed;
  try {
    feed = await client.getFeed(id);
  } catch (error) {
    throw new Error(`Error while fetching feed by it's id, ${error}`);
  }

  if (feed) {
    try {
      const fn = feed.getFiles;
      const boundFn = fn.bind(feed);
      const feedFiles: FeedFile[] = await fetchResource<FeedFile>(
        params,
        boundFn
      );
      return feedFiles;
    } catch (error) {
      throw new Error(`Error while fetching feed files ${error}`);
    }
  } else return [];
};

const getFiles = async (type: string) => {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 100,
    offset: 0,
  };

  try {
    let fileList =
      type == "uploaded"
        ? await client.getUploadedFiles(params)
        : await client.getPACSFiles(params);

    let files: UploadedFile[] | PACSFile[] = [];
    if (fileList.getItems()) {
      if (fileList instanceof UploadedFileList) {
        files = fileList.getItems() as UploadedFile[];
      } else {
        files = fileList.getItems() as PACSFile[];
      }
    }

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList =
          type === "uploaded"
            ? await client.getUploadedFiles(params)
            : await client.getPACSFiles(params);
        if (fileList.getItems()) {
          if (fileList instanceof UploadedFileList) {
            files = fileList.getItems() as UploadedFile[];
          } else {
            files = fileList.getItems() as PACSFile[];
          }
        }
      } catch (error) {
        throw new Error(
          `Error caused while paginating ${type} files, ${error}`
        );
      }
    }
    return files;
  } catch (error) {
    throw new Error(`Error caused while fetching uploaded files, ${error}`);
  }
};

export const buildTree = (paths: string[], cb: (tree: any[]) => void) => {
  const tree: any[] = [];
  _.each(paths, function (path) {
    const pathParts = path.split("/");
    pathParts.shift();
    let currentLevel = tree;
    _.each(pathParts, function (part) {
      const existingPath = _.find(currentLevel, {
        title: part,
      });
      if (existingPath) {
        currentLevel = existingPath.children;
      } else {
        const newPart = {
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
