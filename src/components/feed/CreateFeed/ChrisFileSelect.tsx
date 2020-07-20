import React, { useState, useContext } from "react";
import { CreateFeedContext } from "./context";
import { Split, SplitItem } from "@patternfly/react-core";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import { FolderCloseIcon, FileIcon, CloseIcon } from "@patternfly/react-icons";
import { Tree } from "antd";
import "antd/dist/antd.css";
import {
  Types,
  Info,
  DataBreadcrumb,
  EventNode,
  ChrisFileSelectProp,
  CheckedKeys,
} from "./types";
import { generateTreeNodes, getNewTreeData } from "./utils/fileSelect";

const { DirectoryTree } = Tree;

function getEmptyTree(username: string) {
  let node: DataBreadcrumb[] = [];
  node.push({
    breadcrumb: username,
    title: username,
    key: "0-0",
  });
  return node;
}

const ChrisFileSelect: React.FC<ChrisFileSelectProp> = ({ username }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { chrisFiles, checkedKeys } = state.data;
  const [tree, setTree] = useState<DataBreadcrumb[]>(getEmptyTree(username));

  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setautoExpandParent] = useState(false);

  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys);
    setautoExpandParent(true);
  };

  const onCheck = (checkedKeys: CheckedKeys, info: Info) => {
    if (info.node.breadcrumb) {
      let path = `${info.node.breadcrumb}`;
      if (info.checked === true)
        dispatch({
          type: Types.AddChrisFile,
          payload: {
            file: info.node,
            path,
            checkedKeys,
          },
        });
      else {
        dispatch({
          type: Types.RemoveChrisFile,
          payload: {
            file: info.node,
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

      setTimeout(() => {
        generateTreeNodes(treeNode).then((nodes) => {
          const treeData = [...tree];
          if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
        });

        resolve();
      }, 1000);
    });
  };

  const fileList = chrisFiles.map((file: EventNode, index) => {
    const isFolder =
      (file.children && file.children.length > 0) ||
      (file.title as string).includes("uploads") ||
      (file.title as string).includes("feed");
    const icon = isFolder ? <FolderCloseIcon /> : <FileIcon />;

    return (
      <div className="File-preview" key={index}>
        {icon}
        <span className="file-name">{file.title}</span>
        <CloseIcon
          className="file-remove"
          onClick={() =>
            dispatch({
              type: Types.RemoveChrisFile,
              payload: {
                file,
                checkedKeys,
              },
            })
          }
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
          <DirectoryTree
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
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

export default ChrisFileSelect;
