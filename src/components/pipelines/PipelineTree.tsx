import React from "react";
import Tree from "react-d3-tree";
import { PipelinePluginInstance, RawNodeDatum } from "./pipelinetypes";

const PipelineTree = ({ pluginData, onNodeClick }: {pluginData: PipelinePluginInstance[]; onNodeClick: any}) => {
  // console.log("Plugin Instances from pipeline", pluginData);

  const getPipelineTree = (items: PipelinePluginInstance[]) => {
    const tree = [],
      mappedArr: {
        [key: string]: RawNodeDatum;
      } = {};

    items.forEach((item) => {
      const id = item.id;

      if (!mappedArr.hasOwnProperty(id)) {
        mappedArr[id] = {
          name: "",
          parent: item.previous_id,
          children: [],
          __rd3t: {
            id: "",
            depth: 0,
            collapsed: false,
          },
        };
      }
    });

    for (const id in mappedArr) {
      let mappedElem;
      if (mappedArr.hasOwnProperty(id)) {
        mappedElem = mappedArr[id];

        if (mappedElem.parent) {
          const parentId = mappedElem.parent;
          if (parentId && mappedArr[parentId] && mappedArr[parentId].children)
            mappedArr[parentId].children.push(mappedElem);
        } else {
          tree.push(mappedElem);
        }
      }
    }

    return tree;
  };

  const pipelineTree = getPipelineTree(pluginData);
  // console.log("TREE", pipelineTree);

  return (
    <div id="treeWrapper" style={{ width: "50em", height: "30em" }}>
      {pluginData.length > 0 ? (
        <Tree
          data={pipelineTree}
          orientation="vertical"
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          pathFunc="straight"
          collapsible={false}
          onNodeClick={(node, event) => onNodeClick(node, event)}
        />
      ) : (
        <p>Loading pipeline tree...</p>
      )}
    </div>
  );
};

export default PipelineTree;
