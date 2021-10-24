import React, { Fragment, useRef } from "react";
import { useDispatch } from "react-redux";
import { TreeNode } from "../../../store/workflows/types";
import { tree, hierarchy, HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import TransitionGroupWrapper from "../../../components/feed/FeedTree/TransitionGroupWrapper";
import { useTypedSelector } from "../../../store/hooks";
import { getFeedTree } from "../utils";
import ChrisAPIClient from "../../../api/chrisapiclient";
import {
  setComputeEnvs,
  setCurrentNode,
} from "../../../store/workflows/actions";
import { List, Avatar } from "antd";


const nodeSize = { x: 150, y: 40 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const translate = {
  x: 170,
  y: 25,
};
const scale = 1;

const colorPalette: {
  [key: string]: string;
} = {
  default: "#5998C5",
  host: "#5998C5",
  moc: "#704478",
  titan: "#1B9D92",
  "bu-21-9": "#ADF17F",
};

const Tree = (props: {
  handleNodeClick: (nodeName: {
    data: TreeNode;
    pluginName: string;
    currentComputeEnv?: string;
  }) => void;
}) => {
  const pluginPipings = useTypedSelector(
    (state) => state.workflows.pluginPipings
  );

  const { handleNodeClick } = props;

  const [data, setData] = React.useState<TreeNode[]>();

  React.useEffect(() => {
    if (pluginPipings) {
      const tree = getFeedTree(pluginPipings);
      setData(tree);
    }
  }, [pluginPipings]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes;
    let links = undefined;
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
    }
    return { nodes, links };
  };

  const { nodes, links } = generateTree();

  return (
    <div
      style={{
        width: "65%",
      }}
    >
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
                key={`node + ${i}`}
                data={data}
                position={{ x, y }}
                parent={parent}
                orientation="vertical"
                handleNodeClick={handleNodeClick}
              />
            );
          })}
        </TransitionGroupWrapper>
      </svg>
    </div>
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

class LinkData extends React.Component<LinkProps, LinkState> {
  private linkRef: SVGPathElement | null = null;
  state = {
    initialStyle: {
      opacity: 0,
    },
  };
  componentDidMount() {
    this.applyOpacity(1, 0);
  }
  componentWillLeave(done: () => null) {
    this.applyOpacity(1, 0, done);
  }

  applyOpacity(
    opacity: number,
    transitionDuration: number,
    done = () => {
      return null;
    }
  ) {
    select(this.linkRef).style("opacity", opacity).on("end", done);
  }

  nodeRadius = 12;

  drawPath = () => {
    const { linkData, orientation } = this.props;

    const { source, target } = linkData;

    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = this.nodeRadius,
      targetPadding = this.nodeRadius + 4,
      sourceX = source.x + sourcePadding * normX,
      sourceY = source.y + sourcePadding * normY,
      targetX = target.x - targetPadding * normX,
      targetY = target.y - targetPadding * normY;

    //@ts-ignore

    return orientation === "horizontal"
      ? `M ${sourceY} ${sourceX} L ${targetY} ${targetX}`
      : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };
  render() {
    const { linkData } = this.props;
    return (
      <Fragment>
        <path
          ref={(l) => {
            this.linkRef = l;
          }}
          className="link"
          d={this.drawPath()}
          style={{ ...this.state.initialStyle }}
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
        />
      </Fragment>
    );
  }
}

export interface Point {
  x: number;
  y: number;
}

type NodeProps = {
  data: TreeNode;
  parent: HierarchyPointNode<TreeNode> | null;
  position: Point;
  orientation: string;
  handleNodeClick: (nodeName: {
    data: TreeNode;
    pluginName: string;
    currentComputeEnv?: string;
  }) => void;
};

const setNodeTransform = (orientation: string, position: Point) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};
const DEFAULT_NODE_CIRCLE_RADIUS = 10;
const NodeData = (props: NodeProps) => {
  const dispatch = useDispatch();
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const { data, position, orientation, handleNodeClick } = props;
  const computeEnvs = useTypedSelector((state) => state.workflows.computeEnvs);
  const [pluginName, setPluginName] = React.useState("");

  let current = undefined;
  if (computeEnvs && pluginName && computeEnvs[pluginName]) {
    current = computeEnvs[pluginName].currentlySelected;
  }

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
  };

  React.useEffect(() => {
    async function fetchComputeEnvironments() {
      const client = ChrisAPIClient.getClient();

      const computeEnvs = await client.getComputeResources({
        plugin_id: `${data.plugin_id}`,
      });

      if (computeEnvs.getItems()) {
        if (pluginName) {
          const computeEnvData = {
            [pluginName]: {
              computeEnvs: computeEnvs.data,
              currentlySelected: computeEnvs.data[0].name,
            },
          };

          dispatch(setComputeEnvs(computeEnvData));
        }
      }
    }
    fetchComputeEnvironments();
  }, [data, dispatch, pluginName]);

  React.useEffect(() => {
    async function setDefaultResource() {
      const plugin = await ChrisAPIClient.getClient().getPlugin(data.plugin_id);

      if (plugin) {
        setPluginName(plugin.data.name);

        if (!data.previous_id) {
          dispatch(setCurrentNode(plugin.data.name));
        }
      }
    }

    setDefaultResource();
  }, [data, dispatch]);

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position, data]);

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text ref={textRef} className="label__title">
        {pluginName}
      </text>
    </g>
  );

  return (
    <Fragment>
      <g
        style={{
          cursor: "pointer",
        }}
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          dispatch(setCurrentNode(pluginName));
          if (computeEnvs) {
            const current = computeEnvs[pluginName].currentlySelected;
            handleNodeClick({
              data,
              pluginName,
              currentComputeEnv: current,
            });
          }
        }}
      >
        <circle
          style={{
            fill: `${
              current ? colorPalette[current] : colorPalette["default"]
            }`,
          }}
          id={`node_${data.id}`}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        ></circle>
        {textLabel}
      </g>
    </Fragment>
  );
};

const ConfigurationPage = () => {
  const { computeEnvs, currentNode } = useTypedSelector(
    (state) => state.workflows
  );
  let computeEnvList = [];
  if (computeEnvs && currentNode && computeEnvs[currentNode]) {
    computeEnvList = computeEnvs[currentNode].computeEnvs;
  }

  return (
    <>
      <div
        style={{
          width: "45%",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={computeEnvList}
          renderItem={(item: { name: string; description: string }) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      background: `${
                        colorPalette[item.name]
                          ? colorPalette[item.name]
                          : colorPalette["default"]
                      }`,
                    }}
                  />
                }
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export { Tree, ConfigurationPage };
