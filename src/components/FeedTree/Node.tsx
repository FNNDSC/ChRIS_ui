import { PluginInstance } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { Fragment, memo, useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import {
  getPluginInstancesSuccess,
  getSelectedD3Node,
  getSelectedPlugin,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import AddNodeConnect from "../AddNode/AddNode";
import { AddNodeProvider } from "../AddNode/context";
import AddPipeline from "../AddPipeline/AddPipeline";
import { ThemeContext } from "../DarkTheme/useTheme";
import DeleteNode from "../DeleteNode";
import { PipelineProvider } from "../PipelinesCopy/context";
import { FeedTreeScaleType } from "./Controls";
import DropdownMenu from "./DropdownMenu";
import TreeNodeDatum, { Datum, Point } from "./data";

type NodeWrapperProps = {
  tsNodes?: PluginInstance[];
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<Datum> | null;
  onNodeClick: (node: any) => void;
  onNodeClickTs: (node: PluginInstance) => void;

  orientation: "horizontal" | "vertical";
  overlayScale?: FeedTreeScaleType;
  toggleLabel: boolean;
};

type NodeProps = NodeWrapperProps & {
  status?: string;
  overlaySize?: number;
  currentId: boolean;
};

const DEFAULT_NODE_CIRCLE_RADIUS = 12;

const setNodeTransform = (
  orientation: "horizontal" | "vertical",
  position: Point,
) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};

const Node = (props: NodeProps) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const {
    orientation,
    position,
    data,
    onNodeClick,
    onNodeClickTs,
    toggleLabel,
    status,
    currentId,
    overlaySize,
  } = props;

  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const tsNodes = useTypedSelector((state) => state.tsPlugins.tsNodes);
  const mode = useTypedSelector((state) => state.tsPlugins.treeMode);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances.data,
  );
  const selectedPlugin = useTypedSelector((state) => {
    return state.instance.selectedPlugin;
  });
  const searchFilter = useTypedSelector((state) => state.feed.searchFilter);
  const { value } = searchFilter;

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
    select(textRef.current).attr("transform", "translate(-28, 28)");
  };

  useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position, applyNodeTransform]);

  let statusClass = "";
  let tsClass = "";

  if (
    status &&
    (status === "started" ||
      status === "scheduled" ||
      status === "registeringFiles" ||
      status === "created")
  ) {
    statusClass = "active";
  }
  if (status === "waiting") {
    statusClass = "queued";
  }

  if (status === "finishedSuccessfully") {
    statusClass = "success";
  }

  if (status === "finishedWithError" || status === "cancelled") {
    statusClass = "error";
  }

  if (
    value.length > 0 &&
    (data.item?.data.plugin_name?.toLowerCase().includes(value.toLowerCase()) ||
      data.item?.data.title?.toLowerCase().includes(value.toLowerCase()))
  ) {
    statusClass = "search";
  }

  if (mode === false && tsNodes && tsNodes.length > 0) {
    if (data.item?.data.id) {
      const node = tsNodes.find((node) => node.data.id === data.item?.data.id);
      if (node) {
        tsClass = "graphSelected";
      }
    }
  }

  const previous_id = data.item?.data?.previous_id;
  if (previous_id) {
    const parentNode = pluginInstances?.find(
      (node) => node.data.id === previous_id,
    );

    if (
      parentNode &&
      (parentNode.data.status === "cancelled" ||
        parentNode.data.status === "finishedWithError")
    ) {
      statusClass = "notExecuted";
    }
  }

  // This pipeline code is temporary and will be moved someplace else
  const alreadyAvailableInstances = pluginInstances;
  async function fetchPipelines() {
    const client = ChrisAPIClient.getClient();

    try {
      const pipelineList = await client.getPipelines({
        name: "zip v20240311",
      });

      const pipelines = pipelineList.getItems();

      if (pipelines && pipelines.length > 0) {
        const pipeline = pipelines[0];
        const { id } = pipeline.data;

        //@ts-ignore
        // We do not need to explicitly provide the nodes_info property. This change needs to be made
        // in the js client
        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin?.data.id, // Ensure selectedPlugin is defined
        });

        const pluginInstances = await workflow.getPluginInstances({
          limit: 1000,
        });

        const instanceItems = pluginInstances.getItems();

        if (
          instanceItems &&
          instanceItems.length > 0 &&
          alreadyAvailableInstances
        ) {
          const firstInstance = instanceItems[instanceItems.length - 1];
          const completeList = [...alreadyAvailableInstances, ...instanceItems];

          // Assuming reactDispatch, getSelectedPlugin, getPluginInstanceStatusSuccess, and getPluginInstanceStatusRequest are defined elsewhere
          dispatch(getSelectedPlugin(firstInstance));

          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };

          dispatch(getPluginInstancesSuccess(pluginInstanceObj));
          dispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }
      } else {
        throw new Error(
          "The pipeline to zip is not registered. Please contact an admin",
        );
      }
      return pipelines;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  }

  const mutation = useMutation({
    mutationFn: () => fetchPipelines(),
  });

  useEffect(() => {
    if (mutation.isSuccess || mutation.isError) {
      if (mutation.isSuccess) {
        api.success({
          message: "Zipping process started...",
        });
        mutation.reset();
      }
      if (mutation.isError) {
        api.error({
          message: mutation.error.message,
        });
      }
    }
    if (mutation.isPending) {
      api.info({
        message: "Preparing to initiate the zipping process...",
      });
    }
  }, [mutation.isSuccess, mutation.isError, mutation.isPending]);

  const textLabel = (
    <g
      style={{
        fill: isDarkTheme ? "white" : "black",
      }}
      id={`text_${data.id}`}
    >
      <text ref={textRef} className="label__title">
        {data.item?.data?.title || data.item?.data?.plugin_name}
      </text>
    </g>
  );

  const strokeColor = isDarkTheme ? "white" : "#F0AB00";

  return (
    <Fragment>
      <>
        {/* Note this modals are fired from the dropdown menu in the tree*/}
        <AddNodeProvider>
          <AddNodeConnect />
        </AddNodeProvider>
        {/* Graph Node Container is missing */}
        <DeleteNode />
        <PipelineProvider>
          <AddPipeline />
        </PipelineProvider>
      </>
      {contextHolder}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <g
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          if (data.item) {
            if (mode === false) {
              onNodeClickTs(data.item);
            } else {
              onNodeClick(data);
            }
          }
        }}
      >
        <DropdownMenu
          handleZip={() => {
            mutation.mutate();
          }}
        >
          <circle
            id={`node_${data.id}`}
            className={`node ${statusClass} ${tsClass}`}
            style={{
              stroke: currentId ? strokeColor : "",
              strokeWidth: currentId ? "3px" : "1px",
            }}
            r={DEFAULT_NODE_CIRCLE_RADIUS}
          />
        </DropdownMenu>
        {overlaySize && (
          <circle
            id={`node_overlay_${data.id}`}
            className="node node-overlay"
            opacity={0.3}
            r={DEFAULT_NODE_CIRCLE_RADIUS * overlaySize}
          />
        )}

        {statusClass === "search" ? textLabel : toggleLabel ? textLabel : null}
      </g>
    </Fragment>
  );
};

const NodeMemoed = memo(Node);

const NodeWrapper = (props: NodeWrapperProps) => {
  const dispatch = useDispatch();
  const { data, overlayScale } = props;
  const status = useTypedSelector((state) => {
    if (data.id && state.resource.pluginInstanceStatus[data.id]) {
      return state.resource.pluginInstanceStatus[data.id].status;
    }
  });

  const currentId = useTypedSelector((state) => {
    if (state.instance.selectedPlugin?.data.id === data.id) return true;
    return false;
  });

  useEffect(() => {
    if (currentId) dispatch(getSelectedD3Node(data));
  }, [currentId, data, dispatch]);

  let scale: number | undefined; // undefined scale is treated as no indvidual scaling
  if (overlayScale === "time") {
    const instanceData = props.data.item?.data;
    if (instanceData) {
      const start = new Date(instanceData?.start_date);
      const end = new Date(instanceData?.end_date);
      scale = Math.log10(end.getTime() - start.getTime()) / 2;
    }
  }

  return (
    <NodeMemoed
      {...props}
      status={status || data.item?.data.status}
      overlaySize={scale}
      currentId={currentId}
    />
  );
};

export default memo(
  NodeWrapper,
  (prevProps: NodeWrapperProps, nextProps: NodeWrapperProps) => {
    if (
      prevProps.data !== nextProps.data ||
      prevProps.position !== nextProps.position ||
      prevProps.parent !== nextProps.parent ||
      prevProps.toggleLabel !== nextProps.toggleLabel ||
      prevProps.orientation !== nextProps.orientation
    ) {
      return false;
    }
    return true;
  },
);
