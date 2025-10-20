import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { Input, notification, Switch } from "antd";
import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
import { hierarchy, tree } from "d3-hierarchy";
import { type Quadtree, quadtree } from "d3-quadtree";
import { select } from "d3-selection";
import { type D3ZoomEvent, zoom as d3Zoom, type ZoomBehavior } from "d3-zoom";
import { throttle } from "lodash";
import type React from "react";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import AddNodeConnect from "../AddNode/AddNode";
import { AddNodeProvider } from "../AddNode/context";
import AddPipeline from "../AddPipeline/AddPipeline";
import { ThemeContext } from "../DarkTheme/useTheme";
import DeleteNode from "../DeleteNode";
import { RotateLeft, RotateRight } from "../Icons";
import { PipelineProvider } from "../PipelinesCopy/context";
import DropdownMenu from "./DropdownMenu";
import useSize from "./useSize";

export type TSID = {
  [key: string]: number[];
};

export interface TreeNodeDatum {
  id: number;
  name: string;
  parentId: number | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

export type FeedTreeScaleType = "time" | "cpu" | "memory" | "none";
export type FeedTreeProps = {
  data: TreeNodeDatum;
  tsIds?: TSID;
  currentLayout: boolean;
  changeLayout: () => void;
  onNodeClick: (node: TreeNodeDatum) => void;
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;
  pluginInstances: PluginInstance[];
  statuses: {
    [id: number]: string;
  };
  feed?: Feed;
  isStaff: boolean;
};

const NODE_SIZE = { x: 120, y: 80 };
const SEPARATION = { siblings: 0.75, nonSiblings: 0.75 };
const DEFAULT_NODE_RADIUS = 12;
const SCALE_EXTENT = { min: 0.1, max: 1.5 };
const INITIAL_SCALE = 1;

enum Feature {
  TOGGLE_LABELS = "toggleLabels",
  SCALE_ENABLED = "scale_enabled",
  SCALE_TYPE = "scale_type",
  ORIENTATION = "orientation",
  SEARCH_BOX = "searchBox",
}

interface State {
  overlayScale: {
    enabled: boolean;
    type: FeedTreeScaleType;
  };
  switchState: {
    toggleLabels: boolean;
    searchBox: boolean;
    searchFilter: string;
    orientation: "vertical" | "horizontal";
  };
  treeState: {
    translate: { x: number; y: number };
  };
}

function getInitialState(): State {
  return {
    overlayScale: {
      enabled: false,
      type: "time",
    },
    switchState: {
      toggleLabels: false,
      searchBox: false,
      searchFilter: "",
      orientation: "vertical",
    },
    treeState: {
      translate: { x: 0, y: 0 },
    },
  };
}

type ModalsProps = {
  addNodeLocally: (inst: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;
  feed?: Feed;
  isStaff: boolean;
};

const Modals = (props: ModalsProps) => {
  const { addNodeLocally, removeNodeLocally, feed, isStaff } = props;
  return (
    <>
      <AddNodeProvider>
        <AddNodeConnect addNodeLocally={addNodeLocally} />
      </AddNodeProvider>
      <DeleteNode removeNodeLocally={removeNodeLocally} feed={feed} />
      <PipelineProvider>
        <AddPipeline addNodeLocally={addNodeLocally} isStaff={isStaff} />
      </PipelineProvider>
    </>
  );
};

function isNodeInViewport(
  node: HierarchyPointNode<TreeNodeDatum>,
  transform: { x: number; y: number; k: number },
  width: number,
  height: number,
  padding = 100, // Extra padding to render slightly outside viewport
): boolean {
  // Screen position calculation
  const screenX = node.x * transform.k + transform.x;
  const screenY = node.y * transform.k + transform.y;

  // Check if the node is within the padded viewport
  return (
    screenX >= -padding &&
    screenX <= width + padding &&
    screenY >= -padding &&
    screenY <= height + padding
  );
}

const MemoizedDropdownMenu = memo(DropdownMenu);

export default (props: FeedTreeProps) => {
  const {
    data,
    tsIds,
    currentLayout,
    changeLayout,
    onNodeClick,
    addNodeLocally,
    removeNodeLocally,
    statuses,
    feed,
    isStaff,
  } = props;
  const dispatch = useAppDispatch();
  const { isDarkTheme } = useContext(ThemeContext);
  const [state, updateState] = useImmer(getInitialState());
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    k: INITIAL_SCALE,
  });
  const qtRef = useRef<Quadtree<HierarchyPointNode<TreeNodeDatum>> | null>(
    null,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialRenderRef = useRef(true);
  const size = useSize(containerRef);
  const width = size?.width;
  const height = size?.height;
  const frameIdRef = useRef<number | null>(null);
  const [contextMenuNode, setContextMenuNode] = useState<TreeNodeDatum | null>(
    null,
  );
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });
  const orientation = state.switchState.orientation;
  const selectedPlugin = useAppSelector(
    (store) => store.instance.selectedPlugin,
  );
  const [api, contextHolder] = notification.useNotification();

  const pipelineMutation = useMutation({
    mutationFn: (nodeToZip: PluginInstance) => fetchPipeline(nodeToZip),
    onSuccess: () => {
      api.success({
        message: "Zipping process started...",
      });
    },
    onError: (error: any) => {
      api.error({
        message: error?.message || "Error running pipeline",
      });
    },
  });

  const fetchPipeline = async (pluginInst: PluginInstance) => {
    const client = ChrisAPIClient.getClient();
    const pipelineList = await client.getPipelines({ name: "zip v20240311" });
    const pipelines = pipelineList.getItems();
    if (!pipelines || pipelines.length === 0) {
      throw new Error("The zip pipeline is not registered. Contact admin.");
    }
    api.info({
      message: "Preparing to initiate the zipping process...",
    });
    const pipeline = pipelines[0];
    const { id: pipelineId } = pipeline.data;
    const workflow = await client.createWorkflow(
      pipelineId,
      //@ts-ignore
      {
        previous_plugin_inst_id: pluginInst.data.id,
      },
    );
    const pluginInstancesResponse = await workflow.getPluginInstances({
      limit: 1000,
    });
    const newItems = pluginInstancesResponse.getItems();
    if (newItems && newItems.length > 0) {
      const firstInstance = newItems[newItems.length - 1];
      dispatch(getSelectedPlugin(firstInstance));
      addNodeLocally(newItems);
    }
    return pipelines;
  };

  const d3 = useMemo(() => {
    if (!data)
      return {
        nodes: [] as HierarchyPointNode<TreeNodeDatum>[],
        links: [] as HierarchyPointLink<TreeNodeDatum>[],
        rootNode: null,
      };
    const d3Tree = tree<TreeNodeDatum>()
      .nodeSize(
        orientation === "horizontal"
          ? [NODE_SIZE.y, NODE_SIZE.x]
          : [NODE_SIZE.x, NODE_SIZE.y],
      )
      .separation((a, b) =>
        a.data.parentId === b.data.parentId
          ? SEPARATION.siblings
          : SEPARATION.nonSiblings,
      );
    const root = hierarchy(data, (d) => d.children);
    const layoutRoot = d3Tree(root);
    const computedNodes = layoutRoot.descendants();
    const computedLinks = layoutRoot.links();

    // Efficiently handle topological links
    const newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];
    if (tsIds && Object.keys(tsIds).length > 0) {
      // Create a map for O(1) lookups
      const nodeMap = new Map<number, HierarchyPointNode<TreeNodeDatum>>();
      computedNodes.forEach((node) => {
        nodeMap.set(node.data.id, node);
      });

      // Process topological links more efficiently
      for (const [targetIdStr, parentIds] of Object.entries(tsIds)) {
        const targetId = Number.parseInt(targetIdStr);
        const targetNode = nodeMap.get(targetId);

        if (targetNode) {
          for (const parentId of parentIds) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode) {
              newLinks.push({
                source: parentNode,
                target: targetNode,
              });
            }
          }
        }
      }
    }

    return {
      rootNode: layoutRoot,
      nodes: computedNodes,
      links: [...computedLinks, ...newLinks],
    };
  }, [data, tsIds, orientation]);

  useEffect(() => {
    if (!d3.nodes || d3.nodes.length === 0) return;
    qtRef.current = quadtree<HierarchyPointNode<TreeNodeDatum>>()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(d3.nodes);
  }, [d3.nodes]);

  useLayoutEffect(() => {
    if (
      initialRenderRef.current &&
      d3.rootNode != null &&
      width != null &&
      height != null
    ) {
      const root = d3.rootNode;
      const centerX = width / 2 - root.x;
      const centerY = height / 7 - root.y;
      setTransform({ x: centerX, y: centerY, k: INITIAL_SCALE });
      initialRenderRef.current = false;
    }
  }, [d3.rootNode, width, height]);

  useEffect(() => {
    if (!canvasRef.current || !d3.rootNode || !width || !height) return;
    const handleZoom = throttle(
      (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      },
      50,
    );
    const zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> = d3Zoom<
      HTMLCanvasElement,
      unknown
    >()
      .scaleExtent([SCALE_EXTENT.min, SCALE_EXTENT.max])
      .on("zoom", handleZoom);
    const selection = select(canvasRef.current).call(zoomBehavior);
    return () => {
      selection.on(".zoom", null);
    };
  }, [d3.rootNode, width, height]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(ratio, ratio);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Determine visible nodes to avoid drawing offscreen elements
    const isLargeTree = d3.nodes.length > 200;

    // For small trees, render everything
    // For large trees, only render what's visible
    const visibleNodes = isLargeTree
      ? d3.nodes.filter((node) =>
          isNodeInViewport(node, transform, width, height),
        )
      : d3.nodes;

    // For links, either render all or only those connected to visible nodes
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.data.id));
    const visibleLinks = isLargeTree
      ? d3.links.filter(
          (link) =>
            visibleNodeIds.has(link.source.data.id) ||
            visibleNodeIds.has(link.target.data.id),
        )
      : d3.links;

    // Batch similar drawing operations for better performance
    // 1. Draw all links first (fewer state changes)
    visibleLinks.forEach((link) => drawLink(ctx, link, isDarkTheme));

    // 2. Draw all nodes (bulk operation)
    visibleNodes.forEach((node) => {
      const nodeId = node.data.item.data.id;
      const polledStatus = statuses[nodeId];
      const finalStatus = polledStatus || node.data.item.data.status;
      drawNode({
        ctx,
        node,
        isDarkTheme,
        toggleLabel: state.switchState.toggleLabels,
        searchFilter: state.switchState.searchFilter,
        overlayScale: state.overlayScale.enabled
          ? state.overlayScale.type
          : undefined,
        selectedId: selectedPlugin?.data.id,
        finalStatus,
      });
    });

    ctx.restore();
  }, [
    width,
    height,
    d3.nodes,
    d3.links,
    transform,
    isDarkTheme,
    state.switchState.toggleLabels,
    state.switchState.searchFilter,
    state.overlayScale.enabled,
    state.overlayScale.type,
    statuses,
    selectedPlugin,
  ]);

  useEffect(() => {
    if (frameIdRef.current != null) {
      cancelAnimationFrame(frameIdRef.current);
    }
    frameIdRef.current = requestAnimationFrame(paint);
    return () => {
      if (frameIdRef.current != null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [paint]);

  const handleCanvasClick = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;
      const ratio = window.devicePixelRatio || 1;
      const zoomedX =
        (mouseX * ratio - transform.x * ratio) / (transform.k * ratio);
      const zoomedY =
        (mouseY * ratio - transform.y * ratio) / (transform.k * ratio);

      // Find with a radius that scales with zoom level for better touch targets
      const searchRadius = DEFAULT_NODE_RADIUS / transform.k;
      const hit = qtRef.current?.find(zoomedX, zoomedY, searchRadius);

      if (hit) {
        onNodeClick(hit.data);
      }
    },
    [transform, onNodeClick],
  );

  const getNodeScreenCoords = useCallback(
    (
      nodeX: number,
      nodeY: number,
      transform: { x: number; y: number; k: number },
      containerRect: DOMRect,
    ) => {
      const canvasX = transform.x + transform.k * nodeX;
      const canvasY = transform.y + transform.k * nodeY;
      const screenX = containerRect.left + canvasX;
      const screenY = containerRect.top + canvasY;
      return { screenX, screenY };
    },
    [],
  );

  const handleCanvasContextMenu = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      evt.preventDefault();
      if (!canvasRef.current || !qtRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;
      const ratio = window.devicePixelRatio || 1;
      const zoomedX =
        (mouseX * ratio - transform.x * ratio) / (transform.k * ratio);
      const zoomedY =
        (mouseY * ratio - transform.y * ratio) / (transform.k * ratio);

      // Find with a radius that scales with zoom level for better touch targets
      const searchRadius = DEFAULT_NODE_RADIUS / transform.k;
      const hit = qtRef.current.find(zoomedX, zoomedY, searchRadius);

      if (hit) {
        const { screenX, screenY } = getNodeScreenCoords(
          hit.x,
          hit.y,
          transform,
          containerRef.current!.getBoundingClientRect(),
        );
        setContextMenuNode(hit.data);
        setContextMenuPosition({
          x: screenX + 20,
          y: screenY + 10,
          visible: true,
        });
      } else {
        setContextMenuNode(null);
        setContextMenuPosition({ x: 0, y: 0, visible: false });
      }
    },
    [transform, getNodeScreenCoords],
  );

  const handleChange = useCallback(
    (feature: Feature, payload?: any) => {
      updateState((draft) => {
        switch (feature) {
          case Feature.TOGGLE_LABELS:
            draft.switchState.toggleLabels = !draft.switchState.toggleLabels;
            break;
          case Feature.SCALE_ENABLED:
            draft.overlayScale.enabled = !draft.overlayScale.enabled;
            break;
          case Feature.SCALE_TYPE:
            draft.overlayScale.type = payload;
            break;
          case Feature.ORIENTATION:
            draft.switchState.orientation = payload;
            break;
          case Feature.SEARCH_BOX:
            draft.switchState.searchBox = !draft.switchState.searchBox;
            break;
          default:
            break;
        }
      });
    },
    [updateState],
  );

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {contextHolder}
      <Modals
        feed={feed}
        addNodeLocally={addNodeLocally}
        removeNodeLocally={removeNodeLocally}
        isStaff={isStaff}
      />
      {contextMenuPosition.visible && contextMenuNode && (
        // biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave div.
        <div
          style={{
            position: "absolute",
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 999,
          }}
          onMouseLeave={() => {
            setContextMenuPosition({ x: 0, y: 0, visible: false });
            setContextMenuNode(null);
          }}
        >
          <MemoizedDropdownMenu
            onZip={() => {
              pipelineMutation.mutate(contextMenuNode.item);
              setContextMenuPosition({ x: 0, y: 0, visible: false });
              setContextMenuNode(null);
            }}
          />
        </div>
      )}
      <div
        className="feed-tree__controls"
        style={{ display: "flex", gap: 10, margin: 10 }}
      >
        <div>
          {orientation === "vertical" ? (
            <RotateLeft
              onClick={() => handleChange(Feature.ORIENTATION, "horizontal")}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <RotateRight
              onClick={() => handleChange(Feature.ORIENTATION, "vertical")}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <Switch
          checked={state.switchState.toggleLabels}
          onChange={() => handleChange(Feature.TOGGLE_LABELS)}
          checkedChildren="Labels On"
          unCheckedChildren="Labels Off"
        />
        <Switch
          checked={currentLayout}
          onChange={() => changeLayout()}
          checkedChildren="3D"
          unCheckedChildren="2D"
        />
        <Switch
          checked={state.overlayScale.enabled}
          onChange={() => handleChange(Feature.SCALE_ENABLED)}
          checkedChildren="Node Scale On"
          unCheckedChildren="Node Scale Off"
        />
        {state.overlayScale.enabled && (
          <select
            value={state.overlayScale.type}
            onChange={(e) => handleChange(Feature.SCALE_TYPE, e.target.value)}
          >
            <option value="time">Time</option>
            <option value="cpu">CPU</option>
            <option value="memory">Memory</option>
          </select>
        )}
        <Switch
          checked={state.switchState.searchBox}
          onChange={() => handleChange(Feature.SEARCH_BOX)}
          checkedChildren="Search On"
          unCheckedChildren="Search Off"
        />
        {state.switchState.searchBox && (
          <Input
            placeholder="Search..."
            value={state.switchState.searchFilter}
            onChange={(e) =>
              updateState((draft) => {
                draft.switchState.searchFilter = e.target.value;
              })
            }
            style={{ width: 120 }}
          />
        )}
      </div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "grab" }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
      />
    </div>
  );
};

function drawLink(
  ctx: CanvasRenderingContext2D,
  linkData: HierarchyPointLink<TreeNodeDatum>,
  isDarkTheme: boolean,
) {
  const { source, target } = linkData;
  const nodeRadius = DEFAULT_NODE_RADIUS;
  const isTs = target.data.item.data.plugin_type === "ts";
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  const sourceX = source.x + nodeRadius * nx;
  const sourceY = source.y + nodeRadius * ny;
  const childOffset = nodeRadius + 4;
  const targetX = target.x - childOffset * nx;
  const targetY = target.y - childOffset * ny;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = isDarkTheme ? "#F2F9F9" : "#6A6E73";
  ctx.lineWidth = 0.5;
  if (isTs) {
    ctx.setLineDash([4, 2]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();
  drawArrowHead(ctx, sourceX, sourceY, targetX, targetY);
  ctx.restore();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  arrowSize = 8,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle - Math.PI / 7),
    y2 - arrowSize * Math.sin(angle - Math.PI / 7),
  );
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle + Math.PI / 7),
    y2 - arrowSize * Math.sin(angle + Math.PI / 7),
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle as string;
  ctx.fill();
}

interface DrawNodeOptions {
  ctx: CanvasRenderingContext2D;
  node: HierarchyPointNode<TreeNodeDatum>;
  isDarkTheme: boolean;
  toggleLabel: boolean;
  searchFilter: string;
  overlayScale?: FeedTreeScaleType;
  selectedId?: number;
  finalStatus: string | undefined;
}

function drawNode({
  ctx,
  node,
  isDarkTheme,
  toggleLabel,
  searchFilter,
  overlayScale,
  selectedId,
  finalStatus,
}: DrawNodeOptions) {
  const { x, y } = node;
  const data = node.data;
  const itemData = data.item.data;
  const statusColor = getStatusColor(finalStatus, data, searchFilter);
  const isSelected = selectedId === node.data.id;
  const nodeName = node.data.name || `Node ${node.data.id}`;

  // Calculate scale factor for overlay
  let scaleFactor = 1;
  if (overlayScale === "time" && itemData.start_date && itemData.end_date) {
    const start = new Date(itemData.start_date).getTime();
    const end = new Date(itemData.end_date).getTime();
    const diff = Math.max(1, end - start);
    scaleFactor = Math.log10(diff) / 2;
    if (scaleFactor < 1) scaleFactor = 1;
  }

  // Save context state before drawing node
  ctx.save();

  // Limit text rendering for performance
  const shouldRenderText = toggleLabel || isSelected;

  // Draw node (circle)
  ctx.beginPath();
  ctx.arc(x, y, DEFAULT_NODE_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = statusColor;
  ctx.fill();

  // Draw time overlay if needed
  if (scaleFactor > 1) {
    ctx.beginPath();
    ctx.arc(x, y, DEFAULT_NODE_RADIUS * scaleFactor, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw selection indicator if selected
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(x, y, DEFAULT_NODE_RADIUS * 1.3, 0, 2 * Math.PI);
    ctx.strokeStyle = isDarkTheme ? "#fff" : "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Only render text if needed (major performance gain for large trees)
  if (shouldRenderText) {
    ctx.font = "12px Arial";
    const textWidth = ctx.measureText(nodeName).width;
    ctx.fillStyle = isDarkTheme ? "#fff" : "#000";
    ctx.fillText(nodeName, x - textWidth / 2, y + DEFAULT_NODE_RADIUS * 2 + 5);
  }

  // Restore context state after drawing node
  ctx.restore();
}

function getStatusColor(
  status: string | undefined,
  data: TreeNodeDatum,
  searchFilter: string,
): string {
  if (searchFilter) {
    const term = searchFilter.toLowerCase();
    const pluginName = data.item.data.plugin_name?.toLowerCase() || "";
    const title = data.item.data.title?.toLowerCase() || "";
    if (pluginName.includes(term) || title.includes(term)) {
      return "red";
    }
  }
  switch (status) {
    case "started":
    case "scheduled":
    case "registeringFiles":
    case "created":
      return "#bee1f4";
    case "waiting":
      return "#aaa";
    case "finishedSuccessfully":
      return "#004080";
    case "finishedWithError":
    case "cancelled":
      return "#c9190b";
    default:
      return "#F0AB00";
  }
}
