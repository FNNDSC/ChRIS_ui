import React, { Fragment, useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import { tree, hierarchy } from "d3-hierarchy";
import { select, event } from "d3-selection";
import { linkVertical } from "d3-shape";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { SinglePipeline } from "../CreateFeed/types/pipeline";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import NodeData from "./NodeData";
import { TreeNode, getFeedTree } from "../../api/common";
import useSize from "../FeedTree/useSize";
import { getTsNodesWithPipings } from "../FeedTree/data";

const nodeSize = { x: 200, y: 80 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const scale = 1;
const scaleExtent = {
  min: 0.1,
  max: 1,
};
const zoom = 1;

export interface TreeProps {
  state: SinglePipeline;
  currentPipelineId: number;
  handleSetCurrentNode: (pipelineId: number, currentNode: number) => void;
  handleNodeClick: (
    nodeName: number,
    pipelineId: number,
    plugin_id: number
  ) => void;
  handleSetCurrentNodeTitle: (
    currentPipelineId: number,
    currentNode: number,
    title: string
  ) => void;
  handleSetPipelineEnvironments: (
    pipelineId: number,
    computeEnvData: {
      [x: number]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    }
  ) => void;
}

const Tree = (props: TreeProps) => {
  const divRef = useRef(null);
  const [translate, setTranslate] = React.useState({
    x: 0,
    y: 0,
  });
  const size = useSize(divRef);
  const { currentPipelineId, state, handleSetCurrentNode } = props;
  const { pluginPipings, pipelinePlugins, pluginParameters } = state;

  const [loading, setLoading] = React.useState(false);
  const {
    handleNodeClick,
    handleSetCurrentNodeTitle,
    handleSetPipelineEnvironments,
  } = props;

  const [data, setData] = React.useState<TreeNode[]>();
  const [tsIds, setTsIds] = React.useState<any>();

  const bindZoomListener = React.useCallback(() => {
    const svg = select(`.${svgClassName}`);
    const g = select(`.${graphClassName}`);

    svg.call(
      ///@ts-ignore
      d3Zoom().transform,
      zoomIdentity.translate(translate.x, translate.y).scale(zoom)
    );

    svg.call(
      //@ts-ignore
      d3Zoom()
        .scaleExtent([scaleExtent.min, scaleExtent.max])
        .on("zoom", () => {
          g.attr("transform", event.transform);
        })
    );
  }, [translate.x, translate.y]);

  React.useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  const handleSetCurrentNodeCallback = React.useCallback(
    (id: number) => {
      handleSetCurrentNode(currentPipelineId, id);
    },
    [currentPipelineId, handleSetCurrentNode]
  );

  React.useEffect(() => {
    if (pluginPipings) {
      setLoading(true);
      const tree = getFeedTree(pluginPipings);
      getTsNodesWithPipings(pluginPipings, pluginParameters).then((tsIds) => {
        setTsIds(tsIds);
      });
      setData(tree);
    }
    if (pipelinePlugins) {
      const defaultPlugin = pipelinePlugins[0];
      const defaultPluginId = pluginPipings?.filter((piping: any) => {
        if (piping.data.plugin_id === defaultPlugin.data.id) {
          return piping.data.id;
        }
      });

      if (defaultPluginId) {
        handleSetCurrentNodeCallback(defaultPluginId[0].data.id);
      }
    }
    setLoading(false);
  }, [
    pluginPipings,
    pipelinePlugins,
    pluginParameters,
    currentPipelineId,
    handleSetCurrentNodeCallback,
  ]);

  React.useEffect(() => {
    //@ts-ignore
    if (size && size.width) {
      setTranslate({
        //@ts-ignore
        x: size.width / 2.5,
        //@ts-ignore
        y: size.height / 3,
      });
    }
  }, [size]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes;
    let links: any[] = [];
    let newLinks: any[] = [];
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
      const newLinksToAdd: any[] = [];

      if (tsIds) {
        links.forEach((link) => {
          const targetId = link.target.data.id;
          const sourceId = link.target.data.id;

          if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
            // tsPlugin found
            let topologicalLink: any;

            if (tsIds[targetId]) {
              topologicalLink = link.target;
            } else {
              topologicalLink = link.source;
            }

            const parents = tsIds[topologicalLink.data.id];
            const dict: any = {};
            links &&
              links.forEach((link) => {
                for (let i = 0; i < parents.length; i++) {
                  if (
                    link.source.data.id === parents[i] &&
                    !dict[link.source.data.id]
                  ) {
                    dict[link.source.data.id] = link.source;
                  } else if (
                    link.target.data.id === parents[i] &&
                    !dict[link.target.data.id]
                  ) {
                    dict[link.target.data.id] = link.target;
                  }
                }

                return dict;
              });

            for (const i in dict) {
              newLinksToAdd.push({
                source: dict[i],
                target: topologicalLink,
              });
            }
          }
        });
      }
      newLinks = [...links, ...newLinksToAdd];
    }
    return { nodes, newLinks: newLinks };
  };

  const { nodes, newLinks: links } = generateTree();

  return (
    <>
      <div ref={divRef} className="pipelines__tree">
        {loading ? (
          <span>Fetching Pipeline.....</span>
        ) : translate.x > 0 && translate.y > 0 ? (
          <svg className={`${svgClassName}`} width="100%" height="100%">
            <TransitionGroupWrapper
              component="g"
              className={graphClassName}
              transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
            >
              {links?.map((linkData, i) => {
                return (
                  <LinkData
                    orientation="vertical"
                    key={"link" + i}
                    linkData={linkData}
                  />
                );
              })}
              {nodes?.map(({ data, x, y, parent }, i) => {
                return (
                  <NodeData
                    state={state}
                    key={`node + ${i}`}
                    data={data}
                    position={{ x, y }}
                    parent={parent}
                    orientation="vertical"
                    handleNodeClick={handleNodeClick}
                    currentPipelineId={currentPipelineId}
                    handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
                    handleSetPipelineEnvironments={
                      handleSetPipelineEnvironments
                    }
                  />
                );
              })}
            </TransitionGroupWrapper>
          </svg>
        ) : (
          <Spin>Drawing out the pipelines tree</Spin>
        )}
      </div>
    </>
  );
};
interface LinkProps {
  linkData: any;
  key: string;
  orientation: "vertical";
}

type LinkState = {
  initialStyle: {
    opacity: number;
  };
};

const LinkData: React.FC<LinkProps> = ({ linkData }) => {
  const linkRef = useRef<SVGPathElement | null>(null);
  const [initialStyle] = useState<LinkState["initialStyle"]>({ opacity: 1 });
  const nodeRadius = 12;

  useEffect(() => {
    applyOpacity(1);
  }, []);

  const applyOpacity = (
    opacity: number,
    done = () => {
      return null;
    }
  ) => {
    select(linkRef.current).style("opacity", opacity).on("end", done);
  };

  const { source, target } = linkData;

  const drawPath = (ts: boolean) => {
    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = nodeRadius,
      targetPadding = nodeRadius + 4,
      sourceX = source.x + sourcePadding * normX,
      sourceY = source.y + sourcePadding * normY,
      targetX = target.x - targetPadding * normX,
      targetY = target.y - targetPadding * normY;

    if (ts) {
      return linkVertical()({
        source: [sourceX, sourceY],
        target: [targetX, targetY],
      });
    } else {
      return `M${sourceX} ${sourceY} L${targetX} ${targetY}`;
    }
  };

  const ts = target.data.plugin_name === "pl-topologicalcopy";

  return (
    <Fragment>
      <path
        ref={linkRef}
        className={`link ${ts ? "ts" : ""}`}
        //@ts-ignore
        d={drawPath(ts)}
        style={{ ...initialStyle }}
        data-source-id={linkData.source.id}
        data-target-id={linkData.target.id}
      />
    </Fragment>
  );
};

export default Tree;
