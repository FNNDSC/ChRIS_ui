import React, { useState, useContext } from "react";
import { CreateFeedContext } from "./context";
import { Grid, GridItem } from "@patternfly/react-core";
import { EventDataNode, Key } from "rc-tree/lib/interface";
import { Tree } from "antd";
import "antd/dist/antd.css";

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


let cache: {
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

export function clearCache(){
  cache['tree']=[]
}





const ChrisFileSelect: React.FC<ChrisFileSelectProp> = ({ username }) => {
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
      let path = `${info.node.breadcrumb}`;
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

      setTimeout(() => {
        generateTreeNodes(treeNode, username).then((nodes) => {
          const treeData = [...tree];
          if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
          setCacheTree(treeData);;
        });

        resolve();
      }, 1000);
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
          <DirectoryTree     
            onCheck={onCheck}
            loadData={onLoad}
            checkedKeys={fetchKeysFromDict}
            checkable
            treeData={tree}
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




function getCheckedKeys(checkedKeys: { [key: string]: Key[] }) {
  let checkedKeysArray: Key[] = [];

  for (let i in checkedKeys) {
    checkedKeysArray.push(...checkedKeys[i]);
  }

  return checkedKeysArray;
}