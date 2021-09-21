import { GridItem } from "@patternfly/react-core";
import React, { SyntheticEvent, useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { useTypedSelector } from "../../store/hooks";
import ParentComponent from "../feed/FeedTree/ParentComponent";
import { Datum, Point } from "../feed/FeedTree/data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { ReactNode } from "hoist-non-react-statics/node_modules/@types/react";
import axios from "axios";
interface RawNodeDatum {
  // id:number;
  name: string;
  // attributes?: Record<string, string | number | boolean>;
  children: RawNodeDatum[];
  parent: number;
  __rd3t?: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

const chrisURL = process.env.REACT_APP_CHRIS_UI_URL;

const PipelineTree = ({ pluginData, onNodeClick }: any) => {
  console.log("Plugin Instances from pipeline", pluginData);
  // id: 35
  // pipeline: "https://cube.outreachy.chrisproject.org/api/v1/pipelines/14/"
  // pipeline_id: 14
  // plugin: "https://cube.outreachy.chrisproject.org/api/v1/plugins/3/"
  // plugin_id: 3
  // previous: "https://cube.outreachy.chrisproject.org/api/v1/pipelines/pipings/34/"
  // previous_id: 34
  // url: "https://cube.outreachy.chrisproject.org/api/v1/pipelines/pipings/35/"

  const getPipelineTree = (items: any[]) => {
    const tree = [],
      mappedArr: {
        [key: string]: RawNodeDatum;
      } = {};

    items.forEach((item) => {
      const id = item.id;

      if (!mappedArr.hasOwnProperty(id)) {
        console.log("NAME", item.plugin_name);
        console.log("PARENT", item.previous_id);

        mappedArr[id] = {
          // id: id,
          // name: item.plugin_id,
          name:"",
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
  console.log("TREE", pipelineTree);

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
