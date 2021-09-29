import React, { Fragment, useContext, useRef } from "react";
import { useDispatch } from "react-redux";
import { List, Avatar } from "antd";
import { tree, hierarchy, HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
  Button,
} from "@patternfly/react-core";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { CreateFeedContext } from "./context";
import {
  freesurferPipeline,
  fastsurferPipeline,
  fetalReconstructionPipeline,
} from "../../../pages/WorkflowsPage/utils";
import { AiOutlineUpload } from "react-icons/ai";
import { Pipeline, PipelineList } from "@fnndsc/chrisapi";
import { Types } from "./types";
import { TreeNode } from "../../../store/workflows/types";
import { fetchResource } from "../../../utils";
import { getFeedTree } from "../../../pages/WorkflowsPage/utils";

const workflows = ["fastsurfer", "adultFreesurfer", "fetalReconstruction"];
const workflowTitle: {
  [key: string]: {
    title: string;
  };
} = {
  covidnet: {
    title: "Covidnet",
  },
  infantFreesurfer: {
    title: "Infant Freesurfer",
  },
  infantFreesurferAge: {
    title: "Infant Freesurfer Age",
  },
  adultFreesurfer: {
    title: "Adult Freesurfer",
  },
  fastsurfer: {
    title: "Fastsurfer",
  },
  adultFreesurfermoc: {
    title: "Adult Freesurfer Moc",
  },
  fastsurfermoc: {
    title: "Fastsurfer Moc",
  },
  fetalReconstruction: {
    title: "Fetal Reconstruction",
  },
};

const getPipelineData = (workflow: string) => {
  if (workflow === "fastsurfer") {
    return fastsurferPipeline();
  }
  if (workflow === "fetalReconstruction") {
    return fetalReconstructionPipeline();
  }

  if (workflow === "adultFreesurfer") {
    return freesurferPipeline();
  }
};

const Pipelines = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { pipelineData } = state;
  const { isOpen, toggleTemplateText } = pipelineData.optionState;

  const handleSelect = async (
    event?:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | React.KeyboardEvent<Element>
  ) => {
    const id = event?.currentTarget.id;
    //@ts-ignore
    const name = event?.target.name;

    if (id) {
      dispatch({
        type: Types.SetOptionState,
        payload: {
          toggleTemplateText: name,
          selectedOption: id,
          isOpen: !isOpen,
        },
      });
      const data = getPipelineData(id);
      const { parameters, pluginPipings, pipelinePlugins } =
        await generatePipeline(data);

      dispatch({
        type: Types.SetPipelineResources,
        payload: {
          parameters,
          pluginPipings,
          pipelinePlugins,
        },
      });
    }
  };

  const menuItems = workflows.map((workflow: string) => {
    return (
      <OptionsMenuItem
        onSelect={handleSelect}
        id={workflow}
        key={workflow}
        name={workflowTitle[workflow].title}
      >
        {workflowTitle[workflow].title}
      </OptionsMenuItem>
    );
  });

  const onToggle = () => {
    dispatch({
      type: Types.SetOptionState,
      payload: {
        ...pipelineData.optionState,
        isOpen: !isOpen,
      },
    });
  };

  const toggle = (
    <OptionsMenuToggle
      onToggle={onToggle}
      toggleTemplate={toggleTemplateText}
    />
  );

  const handleNodeClick = (nodeName: string) => {
    dispatch({
      type: Types.SetCurrentNode,
      payload: {
        currentNode: nodeName,
      },
    });
  };

  return (
    <div>
      <h1 className="pf-c-title pf-m-2xl">Pipelines</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0.5rem",
        }}
      >
        <OptionsMenu
          id="option-menu"
          isOpen={isOpen}
          menuItems={menuItems}
          toggle={toggle}
        />
        <UploadJson />
      </div>
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <Tree handleNodeClick={handleNodeClick} />
        <ConfigurationPage />
      </div>
    </div>
  );
};

export const UploadJson = () => {
  const dispatch = useDispatch();
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");

  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const readFile = (file: any) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        if (reader.result) {
          const result = JSON.parse(reader.result as string);
          //  dispatch(setUploadedSpec(result));
          setFileName(result.name);
        }
      } catch (error) {
        console.log("NOT a valid json file");
      }
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  const handleUpload = (event: any) => {
    const file = event.target.files && event.target.files[0];
    readFile(file);
  };
  return (
    <>
      <div>
        <span style={{ marginRight: "0.5rem", fontWeight: 700 }}>
          {fileName}
        </span>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload a JSON spec{" "}
        </Button>
      </div>

      <input
        ref={fileOpen}
        style={{ display: "none" }}
        type="file"
        onChange={handleUpload}
      />
    </>
  );
};

export default Pipelines;

const nodeSize = { x: 150, y: 50 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const translate = {
  x: 150,
  y: 50,
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

const Tree = (props: { handleNodeClick: (nodeName: string) => void }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { pluginPipings, pipelinePlugins } = state.pipelineData;

  const { handleNodeClick } = props;

  const [data, setData] = React.useState<TreeNode[]>();

  React.useEffect(() => {
    if (pluginPipings) {
      const tree = getFeedTree(pluginPipings);
      setData(tree);
    }
    if (pipelinePlugins) {
      const defaultPlugin = pipelinePlugins[pipelinePlugins.length - 1];
      dispatch({
        type: Types.SetCurrentNode,
        payload: {
          currentNode: defaultPlugin.data.name,
        },
      });
    }
  }, [pluginPipings, dispatch, pipelinePlugins]);

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
        height: "400px",
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
  handleNodeClick: (pluginName: string) => void;
};

const setNodeTransform = (orientation: string, position: Point) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};
const DEFAULT_NODE_CIRCLE_RADIUS = 10;
const NodeData = (props: NodeProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const { data, position, orientation, handleNodeClick } = props;
  const [pluginName, setPluginName] = React.useState("");
  const { computeEnvs } = state.pipelineData;
  let currentComputeEnv = "";
  if (pluginName && computeEnvs && computeEnvs[pluginName]) {
    currentComputeEnv = computeEnvs[pluginName].currentlySelected.name;
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
              currentlySelected: computeEnvs.data[0],
            },
          };

          dispatch({
            type: Types.SetPipelineEnvironments,
            payload: {
              computeEnvData,
            },
          });
        }
      }
    }
    fetchComputeEnvironments();
  }, [data, dispatch, pluginName]);

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);

    async function fetchPluginName() {
      const plugin_id = data.plugin_id;
      const client = ChrisAPIClient.getClient();
      const plugin = await client.getPlugin(plugin_id);
      setPluginName(plugin.data.name);
    }

    fetchPluginName();
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
          handleNodeClick(pluginName);
        }}
      >
        <circle
          style={{
            fill: `${
              colorPalette[currentComputeEnv]
                ? colorPalette[currentComputeEnv]
                : colorPalette["default"]
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
  const { state } = useContext(CreateFeedContext);
  const currentNode = state.pipelineData.currentNode;

  const computeEnvList =
    state.pipelineData.computeEnvs &&
    currentNode &&
    state.pipelineData.computeEnvs[currentNode]
      ? state.pipelineData.computeEnvs[currentNode].computeEnvs
      : [];

  return (
    <>
      <div>
        <h4>{`Configuring compute environment for ${
          currentNode ? currentNode : ""
        }`}</h4>

        <List
          itemLayout="horizontal"
          dataSource={computeEnvList ? computeEnvList : []}
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

/***
 *
 * Utils
 */

const generatePipeline = async (data: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineName = data.name;
  const pipelineInstanceList: PipelineList = await client.getPipelines({
    name: pipelineName,
  });
  if (pipelineInstanceList.data) {
    const pipelineInstanceId = pipelineInstanceList.data[0].id;
    const pipelineInstance: Pipeline = await client.getPipeline(
      pipelineInstanceId
    );
    const resources = await fetchResources(pipelineInstance);
    return resources;
  } else {
    const pipelineInstance: Pipeline = await client.createPipeline(data);
    const resources = await fetchResources(pipelineInstance);
    return resources;
  }
};

async function fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 20,
    offset: 0,
  };

  const pipelinePluginsFn = pipelineInstance.getPlugins;
  const pipelineFn = pipelineInstance.getPluginPipings;
  const parameterFn = pipelineInstance.getDefaultParameters;
  const boundPipelinePluginFn = pipelinePluginsFn.bind(pipelineInstance);
  const boundPipelineFn = pipelineFn.bind(pipelineInstance);
  const boundParameterFn = parameterFn.bind(pipelineInstance);
  const pluginPipings: any[] = await fetchResource(params, boundPipelineFn);
  const pipelinePlugins: any[] = await fetchResource(
    params,
    boundPipelinePluginFn
  );
  const parameters: any[] = await fetchResource(params, boundParameterFn);

  return {
    parameters,
    pluginPipings,
    pipelinePlugins,
  };
}
