import { GridItem } from "@patternfly/react-core";
import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { useTypedSelector } from "../../store/hooks";
import ParentComponent from "../feed/FeedTree/ParentComponent";
import { Datum, Point, TreeNodeDatum } from "../feed/FeedTree/data";
import { PluginInstance } from "@fnndsc/chrisapi";

// interface PluginData {
//   pluginData: any[];
// }

interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
  parent: string;
  __rd3t?: { collapsed: boolean; depth: number; id: string };
}

// const orgChart: RawNodeDatum = {
//   name: "Top Level",
//   parent: "null",
//   children: [
//     {
//       name: "Level 2: A",
//       parent: "Top Level",
//       children: [
//         {
//           name: "Son of A",
//           parent: "Level 2: A",
//         },
//         {
//           name: "Daughter of A",
//           parent: "Level 2: A",
//         },
//       ],
//     },
//     {
//       name: "Level 2: B",
//       parent: "Top Level",
//     },
//   ],
// };

const PipelineTree = ({ pluginData }: any) => {
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );

  console.log("Plugin Instances from pipeline", pluginInstances);

  // console.log("Plugin iNstances for pipeline 🤞", pluginInstances)
  // const data = getFeedTree(instances);
  // const pluginInstances = useTypedSelector(
  //   (state) => state.instance.pluginInstances
  // );
  

  const getPipelineTree = (items: any[]) => {
    const tree = [],
      mappedArr: {
        [key: string]: RawNodeDatum;
      } = {};

    items.forEach((item) => {
      const id = item.id;

      if (!mappedArr.hasOwnProperty(id)) {
        mappedArr[id] = {
          name: item.plugin_name,
          parent: item.previous_id,
          children: [],
          // __rd3t: {
          //   id: "",
          //   depth: 0,
          //   collapsed: false,
          // },
        };
      }
    });

    for (const id in mappedArr) {
      let mappedElem;
      if (mappedArr.hasOwnProperty(id)) {
        mappedElem = mappedArr[id];

        // if (mappedElem.parent) {
        //   const parentId = mappedElem.parent;
        //   if (parentId && mappedArr[parentId] && mappedArr[parentId].children)
        //     mappedArr[parentId].children.push(mappedElem);
        // } else {
        //   tree.push(mappedElem);
        // }
      }
    }

    // return tree;
  };

  const TreePipeline = getPipelineTree(pluginData);
  console.log("Tree", TreePipeline);

    const [pipelineTree, setpipelineTree] = useState<RawNodeDatum>({
      name: "Root",
      children: [],
      parent: "null",
    });

  useEffect(() => {
      setpipelineTree({
        name: pluginData[0]?.plugin_name,
        parent: pluginData[0]?.previous,
        children: [
          {
            name: pluginData[1]?.plugin_name,
            parent: pluginData[1]?.previous,
          },
          {
            name: pluginData[2]?.plugin_name,
            parent: pluginData[2]?.previous,
          },
        ],
      });
    }, [pluginData]);

  //   console.log("Props", pluginData);

  return (
    <div id="treeWrapper" style={{ width: "50em", height: "30em" }}>
      {/* <ParentComponent
        isSidePanelExpanded={false}
        isBottomPanelExpanded={false}
        onExpand={onClick}
        onNodeClick={onNodeClick}
        onNodeClickTs={onNodeClickTS}
        instances={TreePipeline}
      /> */}

      <Tree
        data={pipelineTree}
        orientation="vertical"
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        pathFunc="straight"
        collapsible={false}
      />
    </div>
  );
};

export default PipelineTree;
