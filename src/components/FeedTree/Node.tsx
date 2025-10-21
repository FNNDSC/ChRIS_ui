import type { PluginInstance } from "@fnndsc/chrisapi";
import type { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { Fragment, useCallback, useContext, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { ThemeContext } from "../DarkTheme/useTheme";
import type { FeedTreeScaleType } from "./Controls";
import DropdownMenu from "./DropdownMenu";
import type { Point, TreeNodeDatum } from "./data";
import NodeModal from "./NodeModal";
import { getStatusClass, setNodeTransform } from "./NodeUtils";
import usePipelineMutation from "./usePipelineMutation";

/** Constants */
const DEFAULT_NODE_CIRCLE_RADIUS = 12;

type Props = {
  tsNodes?: PluginInstance[];
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  onNodeClick: (node: any) => void;
  orientation: "horizontal" | "vertical";
  overlayScale?: FeedTreeScaleType;
  toggleLabel: boolean;
  searchFilter: string;
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  status?: string;
  overlaySize?: number;
  currentId: boolean;

  isStaff: boolean;
};

export default (props: Props) => {
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
    addNodeLocally,
    isStaff,
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
      <NodeModal addNodeLocally={addNodeLocally} isStaff={isStaff} />
      {contextHolder}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: svg with onClick */}
      <g
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          onNodeClick(data);
        }}
      >
        <DropdownMenu
          onZip={() => {
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
