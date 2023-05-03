import React, { SyntheticEvent, useEffect, useState } from "react";
import { useTypedSelector } from "../../../store/hooks";
import { getPluginInstanceGraph } from "./utils";
import Tree, { CustomNodeElementProps, Orientation, TreeLinkDatum, TreeNodeDatum } from 'react-d3-tree';
import { NodeFileRef, NodeTree } from "./utils/NodeData";
import "./NodeTree.css";
import { HierarchyPointNode } from "d3-hierarchy";
import FileBrowser from "../FeedOutputBrowser/FileBrowser";
import { useFeedBrowser } from "../FeedOutputBrowser/useFeedBrowser";
import "./NodeTree.css";
import { FeedFile } from "@fnndsc/chrisapi";
import FileDetailView from "../Preview/FileDetailView";

function CustomNode({
  element,
  fileBrowserProps,
  selectedFile,
}: {
  element: CustomNodeElementProps;
  fileBrowserProps: any;
  selectedFile?: FeedFile;
}) {
  const { pluginFilesPayload, selected, handleFileClick, filesLoading } =
    fileBrowserProps;
  const data = (element.nodeDatum as unknown as NodeTree).data;

  const hasParent = data.pid != -1;
  const hasChildren =
    element.nodeDatum.children != undefined &&
    element.nodeDatum.children.length > 0;

  return (
    <foreignObject
      className="cs410f23-wrap"
      width={200}
      height={300}
      x={-100}
      y={-150}
    >
      <div className="cs410f23-node">
        <div className="cs410f23-preview">
          {selectedFile && (
            <FileDetailView selectedFile={selectedFile} preview="small" />
          )}
        </div>

        <div className="cs410f23-header">
          <p>{data.title}</p>
          {/* <div className="iw-controls">
						<span><i className="bi bi-image iw-button-preview" onclick="togglePreview('${id}')"></i></span>
						<span><i className="bi bi-folder iw-button-body" onclick="toggleBody('${id}')"></i></span>
					</div> */}

          {hasParent ? (
            <div className="cs410f23-socket cs410f23-socket-left"></div>
          ) : (
            <></>
          )}

          {hasChildren ? (
            <div className="cs410f23-socket cs410f23-socket-right"></div>
          ) : (
            <></>
          )}
        </div>

        <div className="cs410f23-body">
          <div className="cs410f23-fileview">
            {pluginFilesPayload && selected ? (
              <FileBrowser
                selected={selected}
                handleFileClick={handleFileClick}
                pluginFilesPayload={pluginFilesPayload}
                filesLoading={filesLoading}
                usedInsideFeedOutputBrowser={false}
              />
            ) : (
              <div>Files are not available yet </div>
            )}
          </div>
          <div className="cs410f23-status"></div>
        </div>
      </div>
    </foreignObject>
  );
}

const gNodeWidth = 200;

function straightPathFunc(link: TreeLinkDatum): string {
  const { source, target } = link;

  const sourceX = source.y + gNodeWidth / 2;
  const sourceY = source.x + 65;
  const targetX = target.y - gNodeWidth / 2;
  const targetY = target.x + 65;

  // calculate the x and y coordinates of the handle points
  const sourceHandleX = sourceX + 100;
  const sourceHandleY = sourceY;
  const targetHandleX = targetX - 100;
  const targetHandleY = targetY;

  // construct the path using the handle points and node points
  const path = `M${sourceX},${sourceY} C${sourceHandleX},${sourceHandleY} ${targetHandleX},${targetHandleY} ${targetX},${targetY}`;

  return path;

  //return orientation === 'horizontal'
  //	? `M${source.y},${source.x}L${target.y},${target.x}`
  //	: `M${source.x},${source.y}L${target.x},${target.y}`;
}

function ReactFlowContainer() {
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );
  const selectedFile = useTypedSelector((state) => state.explorer.selectedFile);
  const { data: instances } = pluginInstances;

  const [nodes, setNodes] = useState(new NodeTree());

  const fileBrowserProps = useFeedBrowser();

  useEffect(() => {
    if (instances) {
      const getData = async () => {
        const nodeTree = await getPluginInstanceGraph(instances);
        nodeTree && setNodes(nodeTree);
      };

      getData();
    }
  }, [instances]);

  return (
    <div className="cs410f23-node-tree">
      <Tree
        data={nodes}
        draggable={true}
        collapsible={false}
        renderCustomNodeElement={(element: CustomNodeElementProps) => {
          return (
            <CustomNode
              element={element}
              selectedFile={selectedFile}
              fileBrowserProps={fileBrowserProps}
            />
          );
        }}
        pathFunc={straightPathFunc}
        nodeSize={{ x: 300, y: 400 }}
      />
    </div>
  );
}

export default ReactFlowContainer;
