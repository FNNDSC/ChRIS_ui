import React, { useState, useContext } from "react";
import { CreateFeedContext } from "./context";
import { Grid, GridItem } from "@patternfly/react-core";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import {
  FolderCloseIcon,
  FileIcon,
  OutlinedTrashAltIcon,
} from "@patternfly/react-icons";
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
        generateTreeNodes(treeNode,username).then((nodes) => {
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
      <div className="file-preview" key={index}>
        <span className="file-icon">{icon}</span>
        <span className="file-name">{file.title}</span>
        <span className="trash-icon">
          <OutlinedTrashAltIcon
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
        </span>
      </div>
    );
  });

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
