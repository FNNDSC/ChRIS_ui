import type { PluginInstance } from "@fnndsc/chrisapi";
import { Switch, TextInput } from "@patternfly/react-core";
import {
  type HierarchyPointLink,
  type HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import { select } from "d3-selection";
import { type ZoomBehavior, zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { useContext, useEffect, useRef, useCallback } from "react";
import { useImmer } from "use-immer";
import { ThemeContext } from "../DarkTheme/useTheme";
import { RotateLeft, RotateRight } from "../Icons";
import { type FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import Link from "./Link";
import NodeWrapper from "./Node";
import type { TSID } from "./ParentComponent";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import type { TreeNodeDatum } from "./data";
import useSize from "./useSize";

// Constants
const NODE_SIZE = { x: 120, y: 80 };
const SCALE_EXTENT = { min: 0.1, max: 1.5 };
const INITIAL_SCALE = 1;
const SEPARATION = {
  siblings: 0.75,
  nonSiblings: 0.75,
};
const SVG_CLASS_NAME = "feed-tree__svg";
const GRAPH_CLASS_NAME = "feed-tree__graph";

// Feature Enum for Switch Controls
enum Feature {
  TOGGLE_LABELS = "toggleLabels",
  SCALE_ENABLED = "scale_enabled",
  SCALE_TYPE = "scale_type",
  ORIENTATION = "orientation",
  SEARCH_BOX = "searchBox",
}

// Interface Definitions
interface FeedTreeProps {
  onNodeClick: (node: PluginInstance) => void;
  tsIds?: TSID;
  data: TreeNodeDatum[];
  changeLayout: () => void;
  currentLayout: boolean;
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
    translate: {
      x: number;
      y: number;
    };
  };
}

// Initial State Function
const getInitialState = (): State => ({
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
    translate: {
      x: 0,
      y: 0,
    },
  },
});

// FeedTree Component
const FeedTree = ({
  onNodeClick,
  tsIds,
  data,
  changeLayout,
  currentLayout,
}: FeedTreeProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const size = useSize(divRef);
  const [state, updateState] = useImmer(getInitialState());
  const { treeState, switchState, overlayScale } = state;
  const { isDarkTheme } = useContext(ThemeContext);

  // Refs for SVG and G elements
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null,
  );

  // Update Tree Translation based on Size and Orientation
  useEffect(() => {
    if (size?.width && size.height) {
      updateState((draft) => {
        if (switchState.orientation === "vertical") {
          draft.treeState.translate = { x: size.width / 2, y: 90 };
        } else {
          draft.treeState.translate = { x: 180, y: size.height / 3 };
        }
      });
    }
  }, [size, updateState, switchState.orientation]);

  // Generate Tree Structure
  const generateTree = useCallback(
    (data: TreeNodeDatum[]) => {
      const d3Tree = tree<TreeNodeDatum>()
        .nodeSize(
          switchState.orientation === "horizontal"
            ? [NODE_SIZE.y, NODE_SIZE.x]
            : [NODE_SIZE.x, NODE_SIZE.y],
        )
        .separation((a, b) =>
          a.data.parentId === b.data.parentId
            ? SEPARATION.siblings
            : SEPARATION.nonSiblings,
        );

      let nodes: HierarchyPointNode<TreeNodeDatum>[] | undefined;
      let links: HierarchyPointLink<TreeNodeDatum>[] | undefined;
      let newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

      if (data && data.length > 0) {
        const rootNode = d3Tree(hierarchy(data[0], (d) => d.children));
        nodes = rootNode.descendants();
        links = rootNode.links();

        const newLinksToAdd: HierarchyPointLink<TreeNodeDatum>[] = [];

        if (tsIds && Object.keys(tsIds).length > 0) {
          for (const link of links) {
            const targetId = link.target.data.id;
            const sourceId = link.source.data.id;

            if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
              const topologicalLink = tsIds[targetId]
                ? link.target
                : link.source;

              if (topologicalLink?.data.id) {
                const parents = tsIds[topologicalLink.data.id];

                if (parents && parents.length > 0) {
                  const dict: Record<
                    string,
                    HierarchyPointNode<TreeNodeDatum>
                  > = {};

                  for (const innerLink of links) {
                    if (innerLink.source && innerLink.target) {
                      parents.forEach((parentId) => {
                        if (
                          innerLink.source.data.id === parentId &&
                          !dict[parentId]
                        ) {
                          dict[parentId] = innerLink.source;
                        }
                        if (
                          innerLink.target.data.id === parentId &&
                          !dict[parentId]
                        ) {
                          dict[parentId] = innerLink.target;
                        }
                      });
                    }
                  }

                  Object.values(dict).forEach((node) => {
                    newLinksToAdd.push({
                      source: node,
                      target: topologicalLink,
                    });
                  });
                }
              }
            }
          }
        }

        newLinks = [...links, ...newLinksToAdd];
      }

      return { nodes, newLinks };
    },
    [switchState.orientation, tsIds],
  );

  // Generate Nodes and Links
  const { nodes, newLinks: links } = generateTree(data);

  // Handle Switch Changes
  const handleChange = (feature: Feature, data?: any) => {
    updateState((draft) => {
      switch (feature) {
        case Feature.TOGGLE_LABELS:
          draft.switchState.toggleLabels = !draft.switchState.toggleLabels;
          break;

        case Feature.SCALE_ENABLED:
          draft.overlayScale.enabled = !draft.overlayScale.enabled;
          break;

        case Feature.SCALE_TYPE:
          draft.overlayScale.type = data;
          break;

        case Feature.ORIENTATION:
          draft.switchState.orientation = data;
          break;

        case Feature.SEARCH_BOX:
          draft.switchState.searchBox = !draft.switchState.searchBox;
          break;

        default:
          break;
      }
    });
  };

  // Bind and Update Zoom Listener
  const bindZoomListener = useCallback(() => {
    if (!svgRef.current || !gRef.current) return;

    // Initialize Zoom Behavior if not already initialized
    if (!zoomBehaviorRef.current) {
      const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
        .scaleExtent([SCALE_EXTENT.min, SCALE_EXTENT.max])
        .on("zoom", (event) => {
          gRef.current?.setAttribute("transform", event.transform.toString());
        });

      zoomBehaviorRef.current = zoomBehavior;
      select(svgRef.current).call(
        zoomBehavior,
        zoomIdentity
          .translate(treeState.translate.x, treeState.translate.y)
          .scale(INITIAL_SCALE),
      );
    }
  }, [treeState.translate.x, treeState.translate.y]);

  // Initialize and Update Zoom Listener whenever translate changes
  useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  return (
    <div className="feed-tree setFlex grabbable mode_tree" ref={divRef}>
      {/* Controls Section */}
      <div className="feed-tree__container--labels">
        {/* Orientation Toggle */}
        <div className="feed-tree__orientation">
          {switchState.orientation === "vertical" ? (
            <RotateLeft
              onClick={() => handleChange(Feature.ORIENTATION, "horizontal")}
              className="feed-tree__orientation--icon"
              aria-label="Rotate Left"
              aria-hidden="true"
            />
          ) : (
            <RotateRight
              className="feed-tree__orientation--icon"
              aria-label="Rotate Right"
              aria-hidden="true"
              onClick={() => handleChange(Feature.ORIENTATION, "vertical")}
            />
          )}
        </div>

        {/* Toggle Labels Switch */}
        <div className="feed-tree__control">
          <Switch
            id="labels"
            label="Hide Labels"
            labelOff="Show Labels"
            isChecked={switchState.toggleLabels}
            aria-checked={switchState.toggleLabels}
            onChange={() => handleChange(Feature.TOGGLE_LABELS)}
            aria-label="Toggle label visibility"
          />
        </div>

        {/* Switch Layout Toggle */}
        <div className="feed-tree__control">
          <Switch
            id="layout"
            label="Switch Layout"
            labelOff="2D"
            isChecked={currentLayout}
            aria-checked={currentLayout}
            onChange={() => changeLayout()}
            aria-label="Toggle graph layout from 2D to 3D"
          />
        </div>

        {/* Scale Nodes Switch and Dropdown */}
        <div className="feed-tree__control feed-tree__individual-scale">
          <Switch
            id="individual-scale"
            label="Scale Nodes On"
            labelOff="Scale Nodes Off"
            isChecked={overlayScale.enabled}
            aria-checked={overlayScale.enabled}
            onChange={() => handleChange(Feature.SCALE_ENABLED)}
            aria-label="Scale nodes"
          />

          {overlayScale.enabled && (
            <div className="dropdown-wrap">
              <NodeScaleDropdown
                selected={overlayScale.type}
                onChange={(type) => handleChange(Feature.SCALE_TYPE, type)}
              />
            </div>
          )}
        </div>

        {/* Search Box Switch */}
        <div className="feed-tree__control">
          <Switch
            id="search"
            label="Search On"
            labelOff="Search Off"
            isChecked={switchState.searchBox}
            aria-checked={switchState.searchBox}
            onChange={() => handleChange(Feature.SEARCH_BOX)}
            aria-label="Toggle search a node in the tree"
          />
        </div>

        {/* Search Input */}
        <div className="feed-tree__control">
          {switchState.searchBox && (
            <TextInput
              value={switchState.searchFilter}
              onChange={(_event, value: string) =>
                updateState((draft) => {
                  draft.switchState.searchFilter = value;
                })
              }
              aria-label="Search nodes"
              placeholder="Search..."
            />
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      {treeState.translate.x > 0 && treeState.translate.y > 0 && (
        <svg
          ref={svgRef}
          focusable="true"
          className={SVG_CLASS_NAME}
          width="100%"
          height="100%"
          role="img"
          aria-label="Feed Tree Visualization"
        >
          <g ref={gRef} className={GRAPH_CLASS_NAME}>
            <TransitionGroupWrapper
              className={GRAPH_CLASS_NAME}
              component="g"
              transform={`translate(${treeState.translate.x},${treeState.translate.y}) scale(${INITIAL_SCALE})`}
            >
              {/* Render Links */}
              {links?.map((linkData, i) => (
                <Link
                  key={`link${
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    i
                  }`}
                  orientation={switchState.orientation}
                  linkData={linkData}
                  isDarkTheme={isDarkTheme}
                />
              ))}

              {/* Render Nodes */}
              {nodes?.map(({ data, x, y, parent }) => (
                <NodeWrapper
                  key={`node${data.id}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  onNodeClick={(item) => onNodeClick(item)}
                  orientation={switchState.orientation}
                  toggleLabel={switchState.toggleLabels}
                  overlayScale={
                    overlayScale.enabled ? overlayScale.type : undefined
                  }
                  searchFilter={switchState.searchFilter}
                />
              ))}
            </TransitionGroupWrapper>
          </g>
        </svg>
      )}
    </div>
  );
};

export default FeedTree;
