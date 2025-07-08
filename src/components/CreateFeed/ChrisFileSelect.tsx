import React, { useState, useContext, useCallback, useEffect } from "react";
import { CreateFeedContext } from "./context";
import { useWizardContext } from "@patternfly/react-core";
import type { EventDataNode, Key } from "rc-tree/lib/interface";
import { Tree, notification } from "../Antd";

import {
  Types,
  type Info,
  type DataBreadcrumb,
  type ChrisFileSelectProp,
  type CheckedKeys,
} from "./types/feed";
import { generateTreeNodes, getNewTreeData } from "./utils";
import { isEmpty } from "lodash";

const { DirectoryTree } = Tree;

export function clearCache() {
  cache["tree"] = [];
}

function getEmptyTree(username: string) {
  const node: DataBreadcrumb[] = [];
  node.push({
    breadcrumb: `home/${username}`,
    title: `home/${username}`,
    checkable: false,
    key: "0-0",
  });
  node.push({
    breadcrumb: "/SERVICES",
    title: "/SERVICES",
    checkable: false,
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

const ChrisFileSelect: React.FC<ChrisFileSelectProp> = ({
  username,
}: ChrisFileSelectProp) => {
  const { state: stateCreateFeed, dispatch: dispatchCreateFeed } =
    useContext(CreateFeedContext);
  const { chrisFiles, checkedKeys } = stateCreateFeed.data;
  const { goToPrevStep: onBack, goToNextStep: onNext } = useWizardContext();
  const [tree, setTree] = useState<DataBreadcrumb[]>(
    (!isEmpty(getCacheTree()) && getCacheTree()) || getEmptyTree(username),
  );
  const [loadingError, setLoadingError] = useState<Error>();

  const fetchKeysFromDict: Key[] = React.useMemo(
    () => getCheckedKeys(checkedKeys),
    [checkedKeys],
  );

  const onCheck = (checkedKeys: CheckedKeys, info: Info) => {
    if (info.node.breadcrumb) {
      const path = `${info.node.breadcrumb}`;
      if (info.checked === true) {
        dispatchCreateFeed({
          type: Types.AddChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        });
        notification.info({
          message: "New File(s) added",
          description: `New ${path} file(s) added`,
          duration: 1,
        });
      } else {
        dispatchCreateFeed({
          type: Types.RemoveChrisFile,
          payload: {
            file: path,
            checkedKeys,
          },
        });
        notification.info({
          message: "File(s) removed",
          description: `${path} file(s) removed`,
          duration: 1,
        });
      }
      if (info.checkedNodes.length !== 0) {
        const nonDuplicateArray = new Set([
          ...stateCreateFeed.selectedConfig,
          "swift_storage",
        ]);
        dispatchCreateFeed({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: Array.from(nonDuplicateArray),
          },
        });
      }
    }
  };

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.target.closest("INPUT")) return;
      if (chrisFiles.length > 0 && e.code === "ArrowRight") {
        onNext();
      } else if (e.code === "ArrowLeft") {
        onBack();
      }
    },
    [chrisFiles.length, onBack, onNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const onLoad = (treeNode: EventDataNode<any>): Promise<void> => {
    const { children } = treeNode;

    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      generateTreeNodes(treeNode)
        .then((nodes) => {
          const treeData = [...tree];
          if (nodes.length > 0) getNewTreeData(treeData, treeNode.pos, nodes);
          setTree(treeData);
          setCacheTree(treeData);
          resolve();
        })
        .catch((err) => {
          setLoadingError(err);
          resolve();
        });
    });
  };

  return (
    <div className="chris-file-select pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <p>
          Navigate the internal ChRIS storage and select files/directories to
          create an analysis
        </p>
        <br />

        <DirectoryTree
          //@ts-ignore
          onCheck={onCheck}
          //@ts-ignore
          loadData={onLoad}
          checkedKeys={fetchKeysFromDict}
          checkable
          //@ts-ignore
          treeData={tree}
        />

        {loadingError && <div>Loading... </div>}
      </div>
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
