import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { useTypedSelector } from "../../store/hooks";

// interface PluginData {
//   pluginData: any[];
// }

interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
  parent: string;
}

const orgChart: RawNodeDatum = {
  name: "Top Level",
  parent: "null",
  children: [
    {
      name: "Level 2: A",
      parent: "Top Level",
      children: [
        {
          name: "Son of A",
          parent: "Level 2: A",
        },
        {
          name: "Daughter of A",
          parent: "Level 2: A",
        },
      ],
    },
    {
      name: "Level 2: B",
      parent: "Top Level",
    },
  ],
};

const PipelineTree = ({ pluginData }: any) => {
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );

  // console.log("Plugin iNstances for pipeline 🤞", pluginInstances)
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
 
  console.log("Props", pluginData);

  return (
    <div id="treeWrapper" style={{ width: "50em", height: "30em" }}>
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
