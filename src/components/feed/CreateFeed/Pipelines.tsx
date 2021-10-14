import React, { Fragment, useContext, useRef } from "react";
import { List, Avatar } from "antd";
import { tree, hierarchy, HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import {
  Button,
  DataListContent,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  Pagination,
  DataListAction,
} from "@patternfly/react-core";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { CreateFeedContext } from "./context";
import { AiOutlineUpload } from "react-icons/ai";
import { Pipeline, PipelineList } from "@fnndsc/chrisapi";
import { Types } from "./types";
import { TreeNode } from "../../../store/workflows/types";
import { fetchResource } from "../../../utils";
import { getFeedTree } from "../../../pages/WorkflowsPage/utils";

const Pipelines = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { pipelineData, selectedPipeline, pipelines } = state;

  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 5,
    search: "",
    itemCount: 0,
  });

  const [expanded, setExpanded] = React.useState<number[]>([]);
  const { page, perPage } = pageState;

  React.useEffect(() => {
    async function fetchPipelines(perPage: number, page: number) {
      const offset = perPage * (page - 1);
      const client = ChrisAPIClient.getClient();

      const params = {
        limit: perPage,
        offset: offset,
      };

      const registeredPipelinesList = await client.getPipelines(params);
      const registeredPipelines = registeredPipelinesList.getItems();
      if (registeredPipelines) {
        dispatch({
          type: Types.SetPipelines,
          payload: {
            pipelines: registeredPipelines,
          },
        });
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: registeredPipelinesList.totalCount,
          };
        });
      }
    }

    fetchPipelines(perPage, page);
  }, [perPage, page, dispatch]);

  const handleNodeClick = async (nodeName: number, pipelineId: number) => {
    const { computeEnvs } = pipelineData[pipelineId];

    if (computeEnvs && !computeEnvs[nodeName]) {
      const computeEnvData = await fetchComputeInfo(nodeName);
      if (computeEnvData) {
        dispatch({
          type: Types.SetPipelineEnvironments,
          payload: {
            pipelineId,
            computeEnvData,
          },
        });
      }
    }

    dispatch({
      type: Types.SetCurrentNode,
      payload: {
        pipelineId,
        currentNode: nodeName,
      },
    });
  };

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };
  return (
    <div>
      <h1 className="pf-c-title pf-m-2xl"> Registered Pipelines</h1>
      <div>
        <UploadJson />
        <Pagination
          itemCount={pageState.itemCount}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
        />

        <DataList aria-label="pipeline list">
          {pipelines.length > 0 &&
            pipelines.map((pipeline) => {
              return (
                <DataListItem
                  isExpanded={expanded.includes(pipeline.data.id)}
                  key={pipeline.data.id}
                >
                  <DataListItemRow>
                    <DataListToggle
                      onClick={async () => {
                        if (!expanded.includes(pipeline.data.id)) {
                          const { resources } = await generatePipeline(
                            pipeline.data.name
                          );
                          dispatch({
                            type: Types.SetExpandedPipelines,
                            payload: {
                              pipelineId: pipeline.data.id,
                            },
                          });

                          const { parameters, pluginPipings, pipelinePlugins } =
                            resources;

                          dispatch({
                            type: Types.SetPipelineResources,
                            payload: {
                              pipelineId: pipeline.data.id,
                              parameters,
                              pluginPipings,
                              pipelinePlugins,
                            },
                          });
                        }

                        const index = expanded.indexOf(pipeline.data.id);
                        const newExpanded =
                          index >= 0
                            ? [
                                ...expanded.slice(0, index),
                                ...expanded.slice(index + 1, expanded.length),
                              ]
                            : [...expanded, pipeline.data.id];
                        setExpanded(newExpanded);
                      }}
                      isExpanded={expanded.includes(pipeline.id)}
                      id={pipeline.id}
                      aria-controls="expand"
                    />
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={pipeline.data.name}>
                          <div
                            className="plugin-table-row"
                            key={pipeline.data.name}
                          >
                            <span className="plugin-table-row__plugin-name">
                              {pipeline.data.name}
                            </span>
                            <span
                              className="plugin-table-row__plugin-description"
                              id={`${pipeline.data.description}`}
                            >
                              <em>{pipeline.data.description}</em>
                            </span>
                          </div>
                        </DataListCell>,
                      ]}
                    />
                    <DataListAction
                      aria-labelledby="select a pipeline"
                      id={pipeline.data.id}
                      aria-label="actions"
                    >
                      <Button
                        variant="secondary"
                        key="select-action"
                        isDisabled={selectedPipeline === pipeline.data.id}
                        onClick={async () => {
                          if (!(selectedPipeline === pipeline.data.id)) {
                            dispatch({
                              type: Types.SetCurrentPipeline,
                              payload: {
                                pipelineId: pipeline.data.id,
                              },
                            });
                          }
                          if (!pipelineData[pipeline.data.id]) {
                            const { resources } = await generatePipeline(
                              pipeline.data.name
                            );
                            const {
                              parameters,
                              pluginPipings,
                              pipelinePlugins,
                            } = resources;
                            dispatch({
                              type: Types.SetPipelineResources,
                              payload: {
                                pipelineId: pipeline.data.id,
                                parameters,
                                pluginPipings,
                                pipelinePlugins,
                              },
                            });
                          }
                        }}
                      >
                        Select
                      </Button>
                    </DataListAction>
                  </DataListItemRow>
                  <DataListContent
                    aria-label="PrimaryContent"
                    id={pipeline.data.id}
                    isHidden={!expanded.includes(pipeline.data.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                      }}
                    >
                      {expanded.includes(pipeline.data.id) ? (
                        <>
                          <Tree
                            currentPipelineId={pipeline.data.id}
                            handleNodeClick={handleNodeClick}
                          />
                          <ConfigurationPage
                            currentPipelineId={pipeline.data.id}
                          />
                        </>
                      ) : null}
                    </div>
                  </DataListContent>
                </DataListItem>
              );
            })}
        </DataList>
      </div>
    </div>
  );
};

export const UploadJson = () => {
  const { dispatch } = useContext(CreateFeedContext);
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");

  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const readFile = (file: any) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        if (reader.result) {
          const result = JSON.parse(reader.result as string);
          result["plugin_tree"] = JSON.stringify(result["plugin_tree"]);
          setFileName(result.name);
          const { resources, pipelineInstance } = await generatePipeline(
            result.name,
            result
          );
          const { parameters, pluginPipings, pipelinePlugins } = resources;

          dispatch({
            type: Types.AddPipeline,
            payload: {
              pipeline: pipelineInstance,
            },
          });

          dispatch({
            type: Types.SetPipelineResources,
            payload: {
              parameters,
              pluginPipings,
              pipelinePlugins,
            },
          });
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
      <div
        style={{
          margin: "0.35em 0",
        }}
      >
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

const Tree = (props: {
  currentPipelineId: number;
  handleNodeClick: (nodeName: number, pipelineId: number) => void;
}) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { currentPipelineId } = props;
  const { pluginPipings, pipelinePlugins } =
    state.pipelineData[currentPipelineId];
  const [loading, setLoading] = React.useState(false);

  const { handleNodeClick } = props;

  const [data, setData] = React.useState<TreeNode[]>();

  React.useEffect(() => {
    if (pluginPipings) {
      setLoading(true);
      const tree = getFeedTree(pluginPipings);
      setData(tree);
    }
    if (pipelinePlugins) {
      const defaultPlugin = pipelinePlugins[0];
      dispatch({
        type: Types.SetCurrentNode,
        payload: {
          pipelineId: currentPipelineId,
          currentNode: defaultPlugin.data.id,
        },
      });
    }
    setLoading(false);
  }, [pluginPipings, dispatch, pipelinePlugins, currentPipelineId]);

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
      {loading ? (
        <span style={{ color: "black" }}>Fetching Pipeline.....</span>
      ) : (
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
                  currentPipelineId={currentPipelineId}
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      )}
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
  handleNodeClick: (pluginName: number, pipelineId: number) => void;
  currentPipelineId: number;
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
  const { data, position, orientation, handleNodeClick, currentPipelineId } =
    props;
  const [pluginName, setPluginName] = React.useState("");
  const { computeEnvs } = state.pipelineData[currentPipelineId];
  let currentComputeEnv = "";
  if (pluginName && computeEnvs && computeEnvs[data.plugin_id]) {
    currentComputeEnv = computeEnvs[data.plugin_id].currentlySelected;
  }

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
  };

  React.useEffect(() => {
    async function fetchComputeEnvironments() {
      if (!data.previous_id) {
        const computeEnvData = await fetchComputeInfo(data.plugin_id);

        if (computeEnvData) {
          dispatch({
            type: Types.SetPipelineEnvironments,
            payload: {
              pipelineId: currentPipelineId,
              computeEnvData,
            },
          });
        }
      }
    }

    fetchComputeEnvironments();
  }, [data, dispatch, currentPipelineId]);

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
          if (data) handleNodeClick(data.plugin_id, currentPipelineId);
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

const ConfigurationPage = (props: { currentPipelineId: number }) => {
  const { currentPipelineId } = props;
  const { state } = useContext(CreateFeedContext);
  const { currentNode, computeEnvs } = state.pipelineData[currentPipelineId];

  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];

  return (
    <>
      <div>
        <h4>Configuring compute environment </h4>
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

const generatePipeline = async (pipelineName: string, data?: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstanceList: PipelineList = await client.getPipelines({
    name: pipelineName,
  });
  if (pipelineInstanceList.data) {
    const pipelineInstanceId = pipelineInstanceList.data[0].id;
    const pipelineInstance: Pipeline = await client.getPipeline(
      pipelineInstanceId
    );
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  } else {
    const pipelineInstance: Pipeline = await client.createPipeline(data);
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
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

async function fetchComputeInfo(plugin_id: number) {
  const client = ChrisAPIClient.getClient();
  const computeEnvs = await client.getComputeResources({
    plugin_id: `${plugin_id}`,
  });

  if (computeEnvs.getItems()) {
    const computeEnvData = {
      [plugin_id]: {
        computeEnvs: computeEnvs.data,
        currentlySelected: computeEnvs.data[0].name,
      },
    };
    return computeEnvData;
  }
  return undefined;
}
