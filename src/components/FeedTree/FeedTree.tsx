import { useMutation, useQueries } from "@tanstack/react-query";
import { hierarchy, tree } from "d3-hierarchy";
import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import {
  type D3ZoomEvent,
  type ZoomBehavior,
  zoom as d3Zoom,
  zoomIdentity,
} from "d3-zoom";
import { throttle } from "lodash";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
// -------------- React Query & Redux --------------
import { useAppDispatch, useAppSelector } from "../../store/hooks";

// -------------- UI / Components --------------
import { Input, Switch, notification } from "antd";
import { RotateLeft, RotateRight } from "../Icons";
import DropdownMenu from "./DropdownMenu"; // Or your own context-menu component

// -------------- ChRIS & APIs --------------
import type { PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";

// -------------- Dark theme context --------------
import { ThemeContext } from "../DarkTheme/useTheme";

// -------------- Actions & Slices --------------
import {
  getSelectedPlugin,
  setPluginInstancesAndSelectedPlugin,
} from "../../store/pluginInstance/pluginInstanceSlice";

// -------------- Modals (AddNode, DeleteNode, Pipeline, etc.) --------------
import AddNodeConnect from "../AddNode/AddNode";
import { AddNodeProvider } from "../AddNode/context";
import AddPipeline from "../AddPipeline/AddPipeline";
import DeleteNode from "../DeleteNode";
import { PipelineProvider } from "../PipelinesCopy/context";

import useSize from "./useSize";

// -------------- Types --------------
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

interface FeedTreeProps {
  data: TreeNodeDatum; // The entire root node of the feed tree
  tsIds?: TSID; // Topological cross-links
  currentLayout: boolean; // 2D vs. 3D toggle
  changeLayout: () => void; // callback to switch 2D/3D
  onNodeClick: (node: TreeNodeDatum) => void; // callback if you want external usage
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  pluginInstances: PluginInstance[];
}

// -------------- Canvas Layout Constants --------------
const NODE_SIZE = { x: 120, y: 80 };
const SEPARATION = { siblings: 0.75, nonSiblings: 0.75 };
const DEFAULT_NODE_RADIUS = 12;
const SCALE_EXTENT = { min: 0.1, max: 1.5 };
const INITIAL_SCALE = 1;

// -------------- Utility to get initial feed-tree state --------------
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

// -------------- Single place to keep modals --------------
function Modals({
  addNodeLocally,
}: {
  addNodeLocally: (inst: PluginInstance | PluginInstance[]) => void;
}) {
  return (
    <>
      <AddNodeProvider>
        <AddNodeConnect addNodeLocally={addNodeLocally} />
      </AddNodeProvider>
      <DeleteNode />
      <PipelineProvider>
        <AddPipeline addNodeLocally={addNodeLocally} />
      </PipelineProvider>
    </>
  );
}

// -------------- Canvas-based FeedTree --------------
export default function FeedTreeCanvas(props: FeedTreeProps) {
  const {
    data,
    tsIds,
    currentLayout,
    changeLayout,
    onNodeClick,
    addNodeLocally,
    pluginInstances,
  } = props;
  const dispatch = useAppDispatch();
  const { isDarkTheme } = useContext(ThemeContext);

  // Local UI state
  const [state, updateState] = useImmer(getInitialState());
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    k: INITIAL_SCALE,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get container dimensions
  const size = useSize(containerRef);
  const width = size?.width;
  const height = size?.height;

  // For context-menu
  const [contextMenuNode, setContextMenuNode] = useState<TreeNodeDatum | null>(
    null,
  );
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  // For orientation toggling
  const orientation = state.switchState.orientation;

  // -------------- Redux: entire pluginInstances array & selected plugin --------------

  const selectedPlugin = useAppSelector(
    (store) => store.instance.selectedPlugin,
  );

  // -------------- 2) Poll statuses for each plugin instance with useQueries --------------
  const [statuses, setStatuses] = useState<{
    [id: number]: string | undefined;
  }>({});

  // 2) Determine which plugin instances are * not * done
  const incompletePlugins = React.useMemo(() => {
    return pluginInstances.filter((inst) => {
      // If we have a polled status, use it; else default to inst.data.status
      const current = inst.data.status;
      return !isTerminalStatus(current);
    });
  }, [pluginInstances]);

  // 3) useQueries only for those incomplete items
  useQueries({
    queries: incompletePlugins.map((instance) => {
      const id = instance.data.id;
      return {
        queryKey: ["pluginInstanceStatus", id],
        queryFn: async () => {
          const details = await instance.get();
          const latestStatus = details.data.status as string;
          setStatuses((prev) => ({
            ...prev,
            [id]: latestStatus,
          }));

          return latestStatus;
        },
        refetchInterval: (result: {
          state?: {
            data?: string;
          };
        }) => {
          const latestStatus = result?.state?.data;
          // If it transitions to a terminal state, stop polling
          if (isTerminalStatus(latestStatus)) return false;
          return 7000; // otherwise poll every 7s
        },
      };
    }),
  });

  // -------------- 3) Pipeline creation mutation --------------
  const [api, contextHolder] = notification.useNotification();

  const fetchPipeline = async (pluginInst: PluginInstance) => {
    const client = ChrisAPIClient.getClient();
    // Example pipeline name
    const pipelineList = await client.getPipelines({ name: "zip v20240311" });
    const pipelines = pipelineList.getItems();
    if (!pipelines || pipelines.length === 0) {
      throw new Error("The zip pipeline is not registered. Contact admin.");
    }
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
      const fullList = [...pluginInstances, ...newItems];
      dispatch(getSelectedPlugin(firstInstance));
      const pluginInstanceObj = {
        selected: firstInstance,
        pluginInstances: fullList,
      };
      dispatch(setPluginInstancesAndSelectedPlugin(pluginInstanceObj));
    }
    return pipelines;
  };

  const pipelineMutation = useMutation({
    mutationFn: (nodeToZip: PluginInstance) => fetchPipeline(nodeToZip),
    onMutate: () => {
      api.info({
        message: "Preparing to initiate the zipping process...",
      });
    },
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

  // -------------- 1) Build a D3 tree layout in memory --------------
  // We'll create a "hierarchy" and compute x,y for each node. Then optionally center root.
  const d3 = React.useMemo(() => {
    if (!data)
      return {
        nodes: [] as HierarchyPointNode<TreeNodeDatum>[],
        links: [] as HierarchyPointLink<TreeNodeDatum>[],
      };

    // Build a D3 tree with nodeSize & orientation
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

    // Convert root data -> hierarchical layout
    const root = hierarchy(data, (d) => d.children);
    const layoutRoot = d3Tree(root); // <-- sets x, y on each node
    const computedNodes = layoutRoot.descendants();
    const computedLinks = layoutRoot.links();

    // 3) If you want to add "ts" cross-links (tsIds)
    const newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];
    if (tsIds && Object.keys(tsIds).length > 0) {
      for (const link of computedLinks) {
        const sourceId = link.source.data.id;
        const targetId = link.target.data.id;

        if (tsIds[targetId] || tsIds[sourceId]) {
          // We'll just do a naive approach to add dash links
          const topologicalLink = tsIds[targetId] ? link.target : link.source;
          const parents = tsIds[topologicalLink.data.id];
          if (parents && parents.length > 0) {
            const dict: Record<number, HierarchyPointNode<TreeNodeDatum>> = {};
            for (const l of computedLinks) {
              const sId = l.source.data.id;
              const tId = l.target.data.id;
              parents.forEach((pId) => {
                if (sId === pId && !dict[pId]) dict[pId] = l.source;
                if (tId === pId && !dict[pId]) dict[pId] = l.target;
              });
            }
            Object.values(dict).forEach((node) => {
              newLinks.push({
                source: node,
                target: topologicalLink,
              });
            });
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

  // -------------- 4) Bind d3-zoom to the canvas with the updated transform --------------
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

    const root = d3.rootNode; // HierarchyPointNode
    const centerX = width / 2 - root.x;
    const centerY = height / 7 - root.y;

    select(canvasRef.current)
      .call(zoomBehavior)
      // Center the root node in the canvas
      .call(
        zoomBehavior.transform,
        zoomIdentity.translate(centerX, centerY).scale(INITIAL_SCALE),
      );

    return () => {
      select(canvasRef.current).on(".zoom", null);
    };
  }, [d3.rootNode, width, height]);

  // -------------- 5) Draw the nodes/links onto the canvas --------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for devicePixelRatio
    ctx.save();
    ctx.scale(ratio, ratio);

    // Apply current transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw links
    d3.links.forEach((link) => {
      drawLink(ctx, link, isDarkTheme);
    });

    // Draw nodes
    d3.nodes.forEach((node: HierarchyPointNode<TreeNodeDatum>) => {
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

  // -------------- 6) Canvas click => left-click node selection --------------
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

      // Circle hit test
      for (const node of d3.nodes) {
        const dx = node.x - zoomedX;
        const dy = node.y - zoomedY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= DEFAULT_NODE_RADIUS) {
          onNodeClick(node.data);
          return;
        }
      }
    },
    [transform, onNodeClick, d3.nodes],
  );

  const getNodeScreenCoords = useCallback(
    (
      nodeX: number,
      nodeY: number,
      transform: { x: number; y: number; k: number },
      containerRect: DOMRect,
    ) => {
      // 1) Account for the zoom/pan transform
      //    “canvasX” = transform.x + transform.k * nodeX
      //    “canvasY” = transform.y + transform.k * nodeY
      const canvasX = transform.x + transform.k * nodeX;
      const canvasY = transform.y + transform.k * nodeY;

      // 2) Convert from “canvas space” to “page” coords
      //    by adding the container’s bounding rect offsets
      const screenX = containerRect.left + canvasX;
      const screenY = containerRect.top + canvasY;

      return { screenX, screenY };
    },
    [],
  );

  // -------------- 7) Canvas contextmenu => open custom context menu --------------
  const handleCanvasContextMenu = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      evt.preventDefault();
      if (!canvasRef.current) return;

      // We'll still do the 'hit test' to see if user right-clicked a node
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      const ratio = window.devicePixelRatio || 1;
      const zoomedX =
        (mouseX * ratio - transform.x * ratio) / (transform.k * ratio);
      const zoomedY =
        (mouseY * ratio - transform.y * ratio) / (transform.k * ratio);

      let foundNode: TreeNodeDatum | null = null;
      for (const node of d3.nodes) {
        const dx = node.x - zoomedX;
        const dy = node.y - zoomedY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= DEFAULT_NODE_RADIUS) {
          foundNode = node.data; // node.data is your “TreeNodeDatum”
          break;
        }
      }

      if (foundNode) {
        // We have a node. Now, instead of using evt.clientX, we want to get the
        // node’s on-screen coords, so the menu is adjacent to the node circle.

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // The node’s “layout” coords are in “foundNode.x, foundNode.y” inside your d3 Node
        // but we stored “foundNode” as node.data. So we need the actual node’s x,y from d3
        // If you have that in “(node.x, node.y)”, store it. For example, if your “foundNode” had that:
        // For this snippet we assume “foundNode.x, foundNode.y” are available, or you could store them.
        // If you only kept node.data, you need to keep the entire HierarchyPointNode instead.

        // This is the tricky part: we need the “HierarchyPointNode”.
        // Let’s say you keep it as nodeOfInterest: HierarchyPointNode<TreeNodeDatum>.
        // Then nodeOfInterest.x, nodeOfInterest.y are the layout coords.
        // For the sake of example:
        const nodeOfInterest = d3.nodes.find((n) => n.data.id === foundNode.id);
        if (!nodeOfInterest) return;

        const { screenX, screenY } = getNodeScreenCoords(
          nodeOfInterest.x,
          nodeOfInterest.y,
          transform,
          containerRect,
        );

        // + some offset to not overlap the circle
        setContextMenuPosition({
          x: screenX + 10,
          y: screenY,
          visible: true,
        });
        setContextMenuNode(foundNode);
      } else {
        // user right-clicked empty space => maybe hide menu
        setContextMenuNode(null);
        setContextMenuPosition({ x: 0, y: 0, visible: false });
      }
    },
    [transform, d3.nodes, getNodeScreenCoords],
  );

  // -------------- 8) Handle toggles & orientation --------------
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

  // -------------- 9) Render --------------
  return (
    <div
      className="feed-tree-canvas"
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Notification context holder for pipeline creation */}
      {contextHolder}

      {/* Modals for AddNode, DeleteNode, Pipeline, etc. */}
      <Modals addNodeLocally={addNodeLocally} />

      {/* Context menu (conditionally rendered) */}
      {contextMenuPosition.visible && contextMenuNode && (
        <div
          style={{
            position: "absolute",
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 999,
            background: isDarkTheme ? "#333" : "#fff",
            border: "1px solid #ccc",
            padding: 8,
          }}
          onMouseLeave={() => {
            setContextMenuPosition({ x: 0, y: 0, visible: false });
            setContextMenuNode(null);
          }}
        >
          <DropdownMenu
            handleZip={() => {
              pipelineMutation.mutate(contextMenuNode.item);
              setContextMenuPosition({ x: 0, y: 0, visible: false });
              setContextMenuNode(null);
            }}
          />
        </div>
      )}

      {/* Controls for labels, orientation, layout switch, scaling, search */}
      <div
        className="feed-tree__controls"
        style={{ display: "flex", gap: 10, margin: 10 }}
      >
        {/* Orientation Toggle */}
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

        {/* Toggle Labels */}
        <Switch
          checked={state.switchState.toggleLabels}
          onChange={() => handleChange(Feature.TOGGLE_LABELS)}
          checkedChildren="Labels On"
          unCheckedChildren="Labels Off"
        />

        {/* Switch Layout (2D vs. 3D) */}
        <Switch
          checked={currentLayout}
          onChange={() => changeLayout()}
          checkedChildren="3D"
          unCheckedChildren="2D"
        />

        {/* Scale Nodes */}
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

        {/* Search */}
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

      {/* The drawing canvas */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "grab" }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
      />
    </div>
  );
}

// -------------- DRAWING FUNCTIONS --------------

// A) Draw Link

/**
 * Draw a simple straight line from parent->child,
 * then draw a small arrowhead near the child.
 */
function drawLink(
  ctx: CanvasRenderingContext2D,
  linkData: HierarchyPointLink<TreeNodeDatum>,
  isDarkTheme: boolean,
) {
  const { source, target } = linkData;
  const nodeRadius = DEFAULT_NODE_RADIUS;

  // If target is a "ts" plugin => dashed line
  const isTs = target.data.item.data.plugin_type === "ts";

  // offset line so it doesn’t overlap the circle radius
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  // unit direction from parent->child
  const nx = dx / dist;
  const ny = dy / dist;

  // line start, offset by nodeRadius
  const sourceX = source.x + nodeRadius * nx;
  const sourceY = source.y + nodeRadius * ny;

  // line end, offset behind the child’s node
  const childOffset = nodeRadius + 4; // extra 4 so the arrow isn't too close
  const targetX = target.x - childOffset * nx;
  const targetY = target.y - childOffset * ny;

  // 1) Draw the line
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = isDarkTheme ? "#F2F9F9" : "#6A6E73";
  ctx.lineWidth = 0.5; // thinner lines
  if (isTs) {
    ctx.setLineDash([4, 2]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();

  // 2) Draw an arrowhead at the child end
  // We'll define a small helper to do so:
  drawArrowHead(ctx, sourceX, sourceY, targetX, targetY);

  ctx.restore();
}

/**
 * Draw a small arrowhead pointing from (x1,y1) -> (x2,y2).
 * We'll place the arrow tip exactly at (x2,y2).
 */
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  arrowSize = 8,
) {
  // angle from parent->child
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  // Move to the arrow tip
  ctx.moveTo(x2, y2);

  // "wings" at angle ± some spread
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle - Math.PI / 7),
    y2 - arrowSize * Math.sin(angle - Math.PI / 7),
  );
  ctx.lineTo(
    x2 - arrowSize * Math.cos(angle + Math.PI / 7),
    y2 - arrowSize * Math.sin(angle + Math.PI / 7),
  );

  ctx.closePath();
  // fill using the same color as the link stroke
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}
// B) Draw Node
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

/**
 * Replicates Node logic: color by status, highlight if selected or if search hits,
 * optional overlay scaling, label toggles, parent error => notExecuted
 */
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
  const baseRadius = DEFAULT_NODE_RADIUS;
  const data = node.data;
  const itemData = data.item.data;

  // 1) Node color by status
  const color = getStatusColor(finalStatus, data, searchFilter);

  // 2) If node is selected => highlight ring
  const isSelected = selectedId === itemData.id;

  // 3) overlay scale factor (time, CPU, memory, etc.)
  let factor = 1;
  if (overlayScale === "time" && itemData.start_date && itemData.end_date) {
    const start = new Date(itemData.start_date).getTime();
    const end = new Date(itemData.end_date).getTime();
    const diff = Math.max(1, end - start);
    factor = Math.log10(diff) / 2;
    if (factor < 1) factor = 1;
  }

  // 4) Main circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  if (isSelected) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDarkTheme ? "#fff" : "#F0AB00";
    ctx.stroke();
  }

  // 5) If factor > 1, draw outer ring
  if (factor > 1) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius * factor, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 6) Label if toggled or search highlight
  const isSearchHit = color === "red" && searchFilter;
  if (toggleLabel || isSearchHit) {
    ctx.fillStyle = isDarkTheme ? "#fff" : "#000";
    ctx.font = "12px sans-serif";
    const label = itemData.title || itemData.plugin_name || "";
    ctx.fillText(label, node.x + baseRadius + 4, node.y + 4);
  }

  ctx.restore();
}

// -------------- Helper for node color --------------
function getStatusColor(
  status: string | undefined,
  data: TreeNodeDatum,

  searchFilter: string,
): string {
  // Default color
  let color = "#F0AB00";

  // If searchFilter is present, highlight matching name/title in red
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
      color = "#bee1f4";
      break;
    case "waiting":
      color = "#aaa";
      break;
    case "finishedSuccessfully":
      color = "#004080";
      break;
    case "finishedWithError":
    case "cancelled":
      color = "#c9190b";
      break;
    default:
      color = "#004080"; // fallback
      break;
  }

  return color;
}

// -------------- Helper to check if a status is "terminal" --------------
function isTerminalStatus(status?: string) {
  return (
    status === "finishedSuccessfully" ||
    status === "finishedWithError" ||
    status === "cancelled"
  );
}
