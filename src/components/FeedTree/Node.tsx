import {
  Fragment,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import type { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import type { PluginInstance } from "@fnndsc/chrisapi";

import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getSelectedPlugin,
  setPluginInstancesAndSelectedPlugin,
} from "../../store/pluginInstance/pluginInstanceSlice";
import { getPluginInstanceStatusRequest } from "../../store/resources/resourceSlice";

import AddNodeConnect from "../AddNode/AddNode";
import { AddNodeProvider } from "../AddNode/context";
import AddPipeline from "../AddPipeline/AddPipeline";
import { ThemeContext } from "../DarkTheme/useTheme";
import DeleteNode from "../DeleteNode";
import { PipelineProvider } from "../PipelinesCopy/context";
import type { FeedTreeScaleType } from "./Controls";
import DropdownMenu from "./DropdownMenu";
import type { Point, TreeNodeDatum } from "./data";

/** Type definitions */
type NodeWrapperProps = {
  tsNodes?: PluginInstance[];
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  onNodeClick: (node: any) => void;
  orientation: "horizontal" | "vertical";
  overlayScale?: FeedTreeScaleType;
  toggleLabel: boolean;
  searchFilter: string;
};

type NodeProps = NodeWrapperProps & {
  status?: string;
  overlaySize?: number;
  currentId: boolean;
};

/** Constants */
const DEFAULT_NODE_CIRCLE_RADIUS = 12;

/** Helper Functions */

/**
 * Sets the transform attribute for a node based on its orientation.
 */
const setNodeTransform = (
  orientation: "horizontal" | "vertical",
  position: Point,
) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};

/**
 * Determines the CSS class for a node based on its status.
 */
const getStatusClass = (
  status: string | undefined,
  data: TreeNodeDatum,
  pluginInstances: PluginInstance[],
  searchFilter: string,
): string => {
  if (!status) return "";

  let statusClass = "";

  switch (status) {
    case "started":
    case "scheduled":
    case "registeringFiles":
    case "created":
      statusClass = "active";
      break;
    case "waiting":
      statusClass = "queued";
      break;
    case "finishedSuccessfully":
      statusClass = "success";
      break;
    case "finishedWithError":
    case "cancelled":
      statusClass = "error";
      break;
    default:
      break;
  }

  if (
    searchFilter.length > 0 &&
    (data.item?.data.plugin_name
      ?.toLowerCase()
      .includes(searchFilter.toLowerCase()) ||
      data.item?.data.title?.toLowerCase().includes(searchFilter.toLowerCase()))
  ) {
    statusClass = "search";
  }

  const previous_id = data.item?.data?.previous_id;
  if (previous_id) {
    const parentNode = pluginInstances.find(
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

  return statusClass;
};

/**
 * Custom hook to handle pipeline mutation logic.
 */
const usePipelineMutation = (
  selectedPlugin: PluginInstance | undefined,
  pluginInstances: PluginInstance[],
  dispatch: any,
) => {
  const [api, contextHolder] = notification.useNotification();

  const fetchPipelines = async () => {
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
        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin?.data.id,
        });

        const pluginInstancesResponse = await workflow.getPluginInstances({
          limit: 1000,
        });

        const instanceItems = pluginInstancesResponse.getItems();

        if (instanceItems && instanceItems.length > 0) {
          const firstInstance = instanceItems[instanceItems.length - 1];
          const completeList = [...pluginInstances, ...instanceItems];

          dispatch(getSelectedPlugin(firstInstance));

          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };

          dispatch(setPluginInstancesAndSelectedPlugin(pluginInstanceObj));
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
  };

  const mutation = useMutation({
    mutationFn: fetchPipelines,
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      api.success({
        message: "Zipping process started...",
      });
      mutation.reset();
    } else if (mutation.isError) {
      api.error({
        message: (mutation.error as Error).message,
      });
    } else if (mutation.isPending) {
      api.info({
        message: "Preparing to initiate the zipping process...",
      });
    }
  }, [
    api,
    mutation.error,
    mutation.isSuccess,
    mutation.isError,
    mutation.isPending,
    mutation.reset,
  ]);

  return { mutation, contextHolder };
};

/** Components */

/**
 * Modals component to render all modal components.
 */
const Modals = () => (
  <>
    <AddNodeProvider>
      <AddNodeConnect />
    </AddNodeProvider>
    <DeleteNode />
    <PipelineProvider>
      <AddPipeline />
    </PipelineProvider>
  </>
);

/**
 * Node component representing a single node in the tree.
 */
const Node = (props: NodeProps) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const {
    orientation,
    position,
    data,
    onNodeClick,
    toggleLabel,
    status,
    currentId,
    overlaySize,
    searchFilter,
  } = props;

  const dispatch = useAppDispatch();
  const pluginInstances = useAppSelector(
    (state) => state.instance.pluginInstances.data,
  );
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );

  const { mutation, contextHolder } = usePipelineMutation(
    selectedPlugin,
    pluginInstances,
    dispatch,
  );

  const applyNodeTransform = useCallback((transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
    select(textRef.current).attr("transform", "translate(-28, 28)");
  }, []);

  useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position, applyNodeTransform]);

  const statusClass = getStatusClass(
    status,
    data,
    pluginInstances,
    searchFilter,
  );

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
      <Modals />
      {contextHolder}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <g
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          onNodeClick(data);
        }}
      >
        <DropdownMenu
          handleZip={() => {
            mutation.mutate();
          }}
        >
          <circle
            id={`node_${data.id}`}
            className={`node ${statusClass}`}
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
        {(statusClass === "search" || toggleLabel) && textLabel}
      </g>
    </Fragment>
  );
};

const NodeMemoed = memo(Node);

/**
 * NodeWrapper component to connect the Node component with Redux state.
 */
const NodeWrapper = (props: NodeWrapperProps) => {
  const { data, overlayScale } = props;

  const status = useAppSelector((state) => {
    if (data.id && state.resource.pluginInstanceStatus[data.id]) {
      return state.resource.pluginInstanceStatus[data.id].status;
    }
    return undefined;
  });

  const currentId = useAppSelector((state) => {
    return state.instance.selectedPlugin?.data.id === data.id;
  });

  let scale: number | undefined;
  if (overlayScale === "time") {
    const instanceData = data.item?.data;
    if (instanceData) {
      const start = new Date(instanceData.start_date);
      const end = new Date(instanceData.end_date);
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

export default memo(NodeWrapper, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.position === nextProps.position &&
    prevProps.parent === nextProps.parent &&
    prevProps.toggleLabel === nextProps.toggleLabel &&
    prevProps.orientation === nextProps.orientation
  );
});
