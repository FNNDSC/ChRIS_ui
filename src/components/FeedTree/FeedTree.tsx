import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import {
  type ZoomBehavior,
  zoom as d3Zoom,
  zoomIdentity,
  type D3ZoomEvent,
} from "d3-zoom";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import { throttle } from "lodash";

import type { HierarchyPointLink, HierarchyPointNode } from "d3-hierarchy";

import { useMutation, useQueries } from "@tanstack/react-query";
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
  currentLayout: boolean; // 2D vs. 3D toggle, for your UI
  changeLayout: () => void; // callback to switch 2D/3D
  onNodeClick: (node: TreeNodeDatum) => void; // callback if you want external usage
  addNodeLocally: (instance: PluginInstance) => void;
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
}: { addNodeLocally: (inst: PluginInstance) => void }) {
  return (
    <>
      <AddNodeProvider>
        <AddNodeConnect addNodeLocally={addNodeLocally} />
      </AddNodeProvider>
      <DeleteNode />
      <PipelineProvider>
        <AddPipeline />
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
  } = props;
  const dispatch = useAppDispatch();
  const { isDarkTheme } = useContext(ThemeContext);

  // Local UI state
  const [state, updateState] = useImmer(getInitialState());
  const [transform, setTransform] = useState({ x: 0, y: 0, k: INITIAL_SCALE });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For tracking size of our container
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

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

  // -------------- Redux: we might want the entire pluginInstances array --------------
  const pluginInstances = useAppSelector(
    (store) => store.instance.pluginInstances.data,
  );
  const selectedPlugin = useAppSelector(
    (store) => store.instance.selectedPlugin,
  );

  // -------------- 1) Build a D3 tree layout in memory --------------
  // We'll create a "hierarchy" and compute x,y for each node. (No DOM usage, just logic.)
  const d3 = React.useMemo(() => {
    if (!data)
      return { nodes: [], links: [] } as {
        nodes: HierarchyPointNode<TreeNodeDatum>[];
        links: HierarchyPointLink<TreeNodeDatum>[];
      };

    const d3Tree = tree<TreeNodeDatum>()
      .nodeSize(
        orientation === "horizontal"
          ? [NODE_SIZE.y, NODE_SIZE.x]
          : [NODE_SIZE.x, NODE_SIZE.y],
      )
      .separation((a: any, b: any) =>
        a.data.parentId === b.data.parentId
          ? SEPARATION.siblings
          : SEPARATION.nonSiblings,
      );

    // Build the hierarchy from our root data
    const rootNode = d3Tree(hierarchy(data, (d) => d.children));
    const computedNodes = rootNode.descendants();
    const computedLinks = rootNode.links();

    // If you want to add "ts" cross-links (tsIds)
    const newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];
    if (tsIds && Object.keys(tsIds).length > 0) {
      // For each link, see if there's a topological cross-link
      for (const link of computedLinks) {
        const sourceId = link.source.data.id;
        const targetId = link.target.data.id;

        if (tsIds[targetId] || tsIds[sourceId]) {
          // We'll just do a naive approach to add dash links
          const topologicalLink = tsIds[targetId] ? link.target : link.source;
          const parents = tsIds[topologicalLink.data.id];
          if (parents && parents.length > 0) {
            // Build extra links from each parent to topologicalLink
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
      nodes: computedNodes,
      links: [...computedLinks, ...newLinks],
    };
  }, [data, tsIds, orientation]);

  // -------------- 2) Poll statuses for each plugin instance using useQueries --------------
  // We'll store them in a dictionary, keyed by instance ID
  const [statuses, setStatuses] = useState<{
    [id: number]: string | undefined;
  }>({});

  useQueries({
    queries: pluginInstances.map((instance) => {
      const id = instance.data.id;
      return {
        queryKey: ["pluginInstance", id],
        // If the user has the instance, fetch the details for the status
        queryFn: async () => {
          const details = await instance.get();
          return details.data.status as string;
        },
        enabled: !!instance,
        refetchInterval: (data: any) => {
          if (
            data === "finishedWithError" ||
            data === "cancelled" ||
            data === "finishedSuccessfully"
          ) {
            return false;
          }
          return 7000; // 7 seconds
        },
        onSuccess: (status: string) => {
          setStatuses((prev) => ({ ...prev, [id]: status }));
        },
      };
    }),
  });

  // -------------- 3) Pipeline creation mutation (like your "zip" example) --------------
  const [api, contextHolder] = notification.useNotification();

  // "selectedPlugin" is the node for which we want to run the pipeline, typically
  // But if you want to run it from context menu, you might use the "contextMenuNode"
  // or your "selectedPlugin" in Redux. Adjust accordingly.
  const fetchPipeline = async (pluginInst: PluginInstance) => {
    const client = ChrisAPIClient.getClient();
    // For example, we look for pipeline "zip v20240311"
    const pipelineList = await client.getPipelines({ name: "zip v20240311" });
    const pipelines = pipelineList.getItems();
    if (!pipelines || pipelines.length === 0) {
      throw new Error("The zip pipeline is not registered. Contact admin.");
    }
    const pipeline = pipelines[0];
    const { id: pipelineId } = pipeline.data;

    // Now create a workflow
    const workflow = await client.createWorkflow(
      pipelineId,
      //@ts-ignore
      {
        previous_plugin_inst_id: pluginInst.data.id,
      },
    );

    // Then fetch the plugin instances created by that pipeline
    const pluginInstancesResponse = await workflow.getPluginInstances({
      limit: 1000,
    });
    const newItems = pluginInstancesResponse.getItems();
    if (newItems && newItems.length > 0) {
      // We'll assume the last one is interesting
      const firstInstance = newItems[newItems.length - 1];
      const fullList = [...pluginInstances, ...newItems];
      // Redux store updates
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

  // -------------- 4) Track container size --------------
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setWidth(width);
        setHeight(height);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // -------------- 5) On orientation or container resize, update default translate --------------
  useEffect(() => {
    updateState((draft) => {
      if (orientation === "vertical") {
        draft.treeState.translate.x = width / 2;
        draft.treeState.translate.y = 90;
      } else {
        draft.treeState.translate.x = 180;
        draft.treeState.translate.y = height / 3;
      }
    });
    // Also reset transform scale
    setTransform({ x: 0, y: 0, k: INITIAL_SCALE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, width, height, updateState]);

  // -------------- 6) Bind d3-zoom to the canvas --------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    select(canvas).call(
      zoomBehavior,
      zoomIdentity
        .translate(state.treeState.translate.x, state.treeState.translate.y)
        .scale(INITIAL_SCALE),
    );

    return () => {
      // Cleanup if needed
      select(canvas).on(".zoom", null);
    };
  }, [state.treeState.translate]);

  // -------------- 7) Draw the nodes/links onto the canvas --------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    // Set canvas device pixel ratio for crispness
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for device pixel ratio
    ctx.save();
    ctx.scale(ratio, ratio);

    // Then apply the d3 zoom transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw links
    d3.links.forEach((link) => {
      drawLink(ctx, link, isDarkTheme);
    });

    // Draw nodes
    d3.nodes.forEach((node: HierarchyPointNode<TreeNodeDatum>) => {
      // Get the polled status if available, else initial
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
        pluginInstances,
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
    pluginInstances,
    statuses,
    selectedPlugin,
  ]);

  // -------------- 8) Canvas click => left-click node selection --------------
  const handleCanvasClick = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      // Undo the zoom/pan transform and devicePixelRatio
      const ratio = window.devicePixelRatio || 1;
      const zoomedX =
        (mouseX * ratio - transform.x * ratio) / (transform.k * ratio);
      const zoomedY =
        (mouseY * ratio - transform.y * ratio) / (transform.k * ratio);

      // Basic circle hit test
      for (const node of d3.nodes) {
        const dx = node.x - zoomedX;
        const dy = node.y - zoomedY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= DEFAULT_NODE_RADIUS) {
          // Found the clicked node
          onNodeClick(node.data);
          return;
        }
      }
      // If we didn't find a node, maybe de-select
      onNodeClick({} as TreeNodeDatum);
    },
    [transform, onNodeClick, d3.nodes],
  );

  // -------------- 9) Canvas contextmenu => open custom context menu --------------
  const handleCanvasContextMenu = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      evt.preventDefault();
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      // Undo the zoom/pan transform
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
          foundNode = node.data;
          break;
        }
      }
      if (foundNode) {
        setContextMenuNode(foundNode);
        setContextMenuPosition({
          x: evt.clientX,
          y: evt.clientY,
          visible: true,
        });
      } else {
        setContextMenuNode(null);
        setContextMenuPosition({ x: 0, y: 0, visible: false });
      }
    },
    [transform, d3.nodes],
  );

  // -------------- 10) Handle toggles & orientation --------------
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

  // -------------- 11) Render --------------
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

      {/* Controls for labels, layout, scale, search */}
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

// A. Draw Link (a simple line or dashed for "ts" parents)
function drawLink(
  ctx: CanvasRenderingContext2D,
  linkData: HierarchyPointLink<TreeNodeDatum>,
  isDarkTheme: boolean,
) {
  const { source, target } = linkData;
  const nodeRadius = DEFAULT_NODE_RADIUS;

  // Check if target is a "ts" plugin to do dashes, etc. (Optional)
  const isTs = target.data.item.data.plugin_type === "ts";

  // We'll offset lines so they don’t overlap the circle radius exactly
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  const nx = dx / dist;
  const ny = dy / dist;
  const sourceX = source.x + nodeRadius * nx;
  const sourceY = source.y + nodeRadius * ny;
  const targetX = target.x - (nodeRadius + 4) * nx;
  const targetY = target.y - (nodeRadius + 4) * ny;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = isDarkTheme ? "#F2F9F9" : "#6A6E73";
  if (isTs) {
    ctx.setLineDash([4, 2]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(targetX, targetY);
  ctx.stroke();
  ctx.restore();
}

// B. Draw Node
interface DrawNodeOptions {
  ctx: CanvasRenderingContext2D;
  node: HierarchyPointNode<TreeNodeDatum>;
  isDarkTheme: boolean;
  toggleLabel: boolean;
  searchFilter: string;
  overlayScale?: FeedTreeScaleType;
  pluginInstances: PluginInstance[];
  selectedId?: number;
  finalStatus: string | undefined;
}

/**
 * This function replicates the “Node” + “NodeWrapper” logic:
 * - status-based color
 * - searching highlight
 * - scaling circle overlay
 * - label toggles
 * - parent’s error => notExecuted state
 */
function drawNode({
  ctx,
  node,
  isDarkTheme,
  toggleLabel,
  searchFilter,
  overlayScale,
  pluginInstances,
  selectedId,
  finalStatus,
}: DrawNodeOptions) {
  const baseRadius = DEFAULT_NODE_RADIUS;
  const data = node.data;
  const itemData = data.item.data;

  // 1) Determine node color
  const color = getStatusColor(
    finalStatus,
    data,
    pluginInstances,
    searchFilter,
  );

  // 2) If node is selected => highlight ring
  const isSelected = selectedId === itemData.id;

  // 3) Compute overlay scale factor (if overlayScale === "time", for example)
  let factor = 1;
  if (overlayScale === "time" && itemData.start_date && itemData.end_date) {
    const start = new Date(itemData.start_date).getTime();
    const end = new Date(itemData.end_date).getTime();
    const diff = Math.max(1, end - start);
    factor = Math.log10(diff) / 2;
    if (factor < 1) factor = 1;
  }

  // 4) Draw the main circle
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

  // 5) If overlay is > 1, draw outer ring
  if (factor > 1) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius * factor, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 6) If label toggled or we matched search highlight
  //    (some folks only want label if search or if toggle is on)
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
  pluginInstances: PluginInstance[],
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

  // If the parent was in error => notExecuted
  const prevId = data.item.data.previous_id;
  if (prevId) {
    const parent = pluginInstances.find((p) => p.data.id === prevId);
    if (
      parent &&
      (parent.data.status === "cancelled" ||
        parent.data.status === "finishedWithError")
    ) {
      color = "gray"; // "notExecuted"
    }
  }
  return color;
}
