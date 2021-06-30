import React, { useState, useContext } from "react";
import { CreateFeedContext } from "./context";
import { Grid, GridItem } from "@patternfly/react-core";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import { Tree } from "antd";
import { ErrorBoundary } from "react-error-boundary";
import {
  Types,
  Info,
  DataBreadcrumb,
  ChrisFileSelectProp,
  CheckedKeys,
} from "./types";
import { generateTreeNodes, getNewTreeData } from "./utils/fileSelect";
import { FileList } from "./helperComponents";
import { isEmpty } from "lodash";
import { ErrorMessage } from "./lib";

const { DirectoryTree } = Tree;

function getEmptyTree(username: string) {
  const node: DataBreadcrumb[] = [];
  node.push({
    breadcrumb: username,
    title: username,
    key: "0-0",
  });
  node.push({
    breadcrumb: "SERVICES",
    title: "SERVICES",
    key: "0-1",
  });
  return node;
}

// Needs to be replaced with a better caching solution

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

const ChrisFileSelect: React.FC<ChrisFileSelectProp> = ({
  username,
}: ChrisFileSelectProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { chrisFiles, checkedKeys } = state.data;
  const [tree, setTree] = useState<DataBreadcrumb[]>(
    (!isEmpty(getCacheTree()) && getCacheTree()) || getEmptyTree(username)
  );

  const fetchKeysFromDict: Key[] = React.useMemo(
    () => getCheckedKeys(checkedKeys),
    [checkedKeys]
  );

  const onCheck = (checkedKeys: CheckedKeys, info: Info) => {
    if (info.node.breadcrumb) {
      const path = `${info.node.breadcrumb}`;
      if (info.checked === true)
        dispatch({
          type: Types.AddChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        });
      else {
        dispatch({
          type: Types.RemoveChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        });
      }
    }
  };

  const onLoad = (treeNode: EventDataNode): Promise<void> => {
    const { children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      generateTreeNodes(treeNode, username).then((nodes) => {
        const treeData = [...tree];
        if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
        setTree(treeData);
        setCacheTree(treeData);
        resolve();
      });
    });
  };

  const fileList =
    chrisFiles.length > 0
      ? chrisFiles.map((file: string, index: number) => (
          <React.Fragment key={index}>
            <FileList file={file} index={index} />
          </React.Fragment>
        ))
      : null;

  return (
    <div className="chris-file-select">
      <h1 className="pf-c-title pf-m-2xl">
        File Selection: File Select from internal ChRIS storage
      </h1>
      <p>
        Navigate the internal ChRIS storage and select files/directories to
        create a feed
      </p>
      <br />
      <Grid hasGutter={true}>
        <GridItem span={6} rowSpan={12}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DirectoryTree
              onCheck={onCheck}
              loadData={onLoad}
              checkedKeys={fetchKeysFromDict}
              checkable
              treeData={tree}
            />
          </ErrorBoundary>
        </GridItem>
        <GridItem span={6} rowSpan={12}>
          <p className="section-header">Files to add to new feed:</p>
          <div className="file-list">{fileList}</div>
        </GridItem>
      </Grid>
    </div>
  );
};

export default ChrisFileSelect;

function getCheckedKeys(checkedKeys: { [key: string]: Key[] }) {
  const checkedKeysArray: Key[] = [];

  for (const i in checkedKeys) {
    checkedKeysArray.push(...checkedKeys[i]);
  }

  return checkedKeysArray;
}

function ErrorFallback({ error }: any) {
  return <ErrorMessage error={error} />;
}
