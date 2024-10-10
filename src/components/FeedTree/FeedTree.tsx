import { Switch, TextInput } from "@patternfly/react-core";
import {
  type HierarchyPointLink,
  type HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import { type Selection, select } from "d3-selection";
import { type ZoomBehavior, zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { isEqual } from "lodash";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  setFeedLayout,
  setSearchFilter,
  setTranslate,
} from "../../store/feed/feedSlice";
import type { FeedTreeProp } from "../../store/feed/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import { RotateLeft, RotateRight } from "../Icons";
import { type FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import Link from "./Link";
import NodeWrapper from "./Node";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import type TreeNodeDatum from "./data";
import type { OwnProps, Point } from "./data";
import useSize from "./useSize";

type FeedTreeFeature =
  | "scale_enabled"
  | "scale_type"
  | "collapsible"
  | "toggleLabel"
  | "search";

type FeedTreeState = {
  d3: {
    translate: Point;
    scale: number;
  };
  overlayScale: {
    enabled: boolean;
    type: FeedTreeScaleType;
  };
  collapsible: boolean;
  toggleLabel: boolean;
  search: boolean;
};

function calculateD3Geometry(nextProps: OwnProps, feedTreeProp: FeedTreeProp) {
  let scale = nextProps.zoom;
  if (nextProps.zoom > nextProps.scaleExtent.max) {
    scale = nextProps.scaleExtent.max;
  } else if (nextProps.zoom < nextProps.scaleExtent.min) {
    scale = nextProps.scaleExtent.min;
  }
  return {
    translate: feedTreeProp.translate,
    scale,
  };
}

function getInitialState(
  props: OwnProps,
  feedTreeProp: FeedTreeProp,
): FeedTreeState {
  return {
    d3: calculateD3Geometry(props, feedTreeProp),
    overlayScale: {
      enabled: false,
      type: "time",
    },
    collapsible: false,
    toggleLabel: false,
    search: false,
  };
}

const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";

const FeedTree: React.FC<OwnProps> = ({
  data,
  zoom = 1,
  scaleExtent = { min: 0.1, max: 1.5 },
  nodeSize = { x: 120, y: 80 },
  separation,
  tsIds,
  changeOrientation,
  onNodeClick,
}) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const dispatch = useAppDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const { feedTreeProp, currentLayout, searchFilter } = useAppSelector(
    (state) => state.feed,
  );
  const [feedTree, setFeedTree] = useState<{
    nodes?: HierarchyPointNode<TreeNodeDatum>[];
    links?: HierarchyPointLink<TreeNodeDatum>[];
  }>({
    nodes: [],
    links: [],
  });
  const size = useSize(divRef);
  const { translate, orientation } = feedTreeProp;
  const [feedState, setFeedState] = useState<FeedTreeState>(
    getInitialState(
      {
        data,
        zoom,
        scaleExtent,
        nodeSize,
        separation,
        tsIds,
        changeOrientation,
        onNodeClick,
      },
      feedTreeProp,
    ),
  );
  const { scale } = feedState.d3;
  const generateTree = useCallback(
    (data: TreeNodeDatum[]) => {
      const d3Tree = tree<TreeNodeDatum>()
        .nodeSize(
          orientation === "horizontal"
            ? [nodeSize.y, nodeSize.x]
            : [nodeSize.x, nodeSize.y],
        )
        .separation((a, b) =>
          a.data.parentId === b.data.parentId
            ? separation.siblings
            : separation.nonSiblings,
        );

      let nodes: HierarchyPointNode<TreeNodeDatum>[] | undefined;
      let links: HierarchyPointLink<TreeNodeDatum>[] | undefined;
      let newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

      if (data && data.length > 0) {
        const rootNode = d3Tree(
          hierarchy(data[0], (d) => (d.__rd3t?.collapsed ? null : d.children)),
        );
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
    [nodeSize, orientation, separation, tsIds],
  );

  useEffect(() => {
    if (size?.width) {
      if (orientation === "vertical") {
        dispatch(setTranslate({ x: size.width / 2, y: 90 }));
      } else {
        dispatch(setTranslate({ x: 180, y: size.height / 3 }));
      }
    }
  }, [size, orientation, dispatch]);

  useEffect(() => {
    if (data && data.length > 0) {
      const { nodes, newLinks: links } = generateTree(data);
      setFeedTree({ nodes, links });
    }
  }, [data, generateTree]);

  const bindZoomListener = () => {
    const svg: Selection<SVGSVGElement, unknown, HTMLElement, any> = select(
      `.${svgClassName}`,
    );
    const g: Selection<SVGGElement, unknown, HTMLElement, any> = select(
      `.${graphClassName}`,
    );
    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3Zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([scaleExtent.min, scaleExtent.max])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg
      .call(zoomBehavior)
      .call(
        zoomBehavior.transform,
        zoomIdentity.translate(translate.x, translate.y).scale(scale),
      );
  };

  useEffect(() => {
    bindZoomListener();
  }, []);

  const handleChange = useCallback((feature: FeedTreeFeature, data?: any) => {
    setFeedState((prevState) => {
      switch (feature) {
        case "scale_enabled":
          return {
            ...prevState,
            overlayScale: {
              ...prevState.overlayScale,
              enabled: !prevState.overlayScale.enabled,
            },
          };
        case "scale_type":
          return {
            ...prevState,
            overlayScale: {
              ...prevState.overlayScale,
              type: data as FeedTreeScaleType,
            },
          };
        case "collapsible":
        case "toggleLabel":
        case "search":
          return {
            ...prevState,
            [feature]: !prevState[feature],
          };
        default:
          return prevState;
      }
    });
  }, []);

  const handleNodeClick = useCallback(
    (item: any) => {
      onNodeClick(item);
    },
    [onNodeClick],
  );

  const { nodes, links } = feedTree;

  return (
    <div className="feed-tree setFlex grabbable mode_tree" ref={divRef}>
      <div className="feed-tree__container">
        <div className="feed-tree__container--labels">
          <div
            onClick={() => changeOrientation(orientation)}
            className="feed-tree__orientation"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                changeOrientation(orientation);
              }
            }}
          >
            {orientation === "vertical" ? (
              <RotateLeft
                className="feed-tree__orientation--icon"
                aria-label="Rotate Left"
                aria-hidden="true"
              />
            ) : (
              <RotateRight
                className="feed-tree__orientation--icon"
                aria-label="Rotate Right"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="feed-tree__control">
            <Switch
              id="labels"
              label="Hide Labels"
              labelOff="Show Labels"
              isChecked={feedState.toggleLabel}
              aria-checked={feedState.toggleLabel}
              onChange={() => handleChange("toggleLabel")}
              aria-label="Toggle label visibility"
            />
          </div>

          <div className="feed-tree__control">
            <Switch
              id="layout"
              label="Switch Layout"
              labelOff="2D"
              isChecked={currentLayout}
              aria-checked={currentLayout}
              onChange={() => dispatch(setFeedLayout())}
              aria-label="Toggle graph layout from 2D to 3D"
            />
          </div>

          <div className="feed-tree__control feed-tree__individual-scale">
            <Switch
              id="individual-scale"
              label="Scale Nodes On"
              labelOff="Scale Nodes Off"
              isChecked={feedState.overlayScale.enabled}
              aria-checked={feedState.overlayScale.enabled}
              onChange={() => handleChange("scale_enabled")}
              aria-label="Scale nodes"
            />

            {feedState.overlayScale.enabled && (
              <div className="dropdown-wrap">
                <NodeScaleDropdown
                  selected={feedState.overlayScale.type}
                  onChange={(type) => handleChange("scale_type", type)}
                />
              </div>
            )}
          </div>

          <div className="feed-tree__control">
            <Switch
              id="search"
              label="Search On"
              labelOff="Search Off"
              isChecked={feedState.search}
              aria-checked={feedState.search}
              onChange={() => handleChange("search")}
              aria-label="Toggle search a node in the tree"
            />
          </div>

          <div className="feed-tree__control">
            {feedState.search && (
              <TextInput
                value={searchFilter.value}
                onChange={(_, value: string) =>
                  dispatch(setSearchFilter(value.trim()))
                }
              />
            )}
          </div>
        </div>
      </div>

      {translate.x > 0 && translate.y > 0 && (
        <svg
          focusable="true"
          className={svgClassName}
          width="100%"
          height="100%"
          role="img"
          aria-label="Feed Tree Visualization"
        >
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => (
              <Link
                key={`link${i}`}
                orientation={orientation}
                linkData={linkData}
                isDarkTheme={isDarkTheme}
              />
            ))}

            {nodes?.map(({ data, x, y, parent }) => (
              <NodeWrapper
                key={`node${data.id}`}
                data={data}
                position={{ x, y }}
                parent={parent}
                onNodeClick={handleNodeClick}
                orientation={orientation}
                toggleLabel={feedState.toggleLabel}
                overlayScale={
                  feedState.overlayScale.enabled
                    ? feedState.overlayScale.type
                    : undefined
                }
              />
            ))}
          </TransitionGroupWrapper>
        </svg>
      )}
    </div>
  );
};

const FeedTreeMemoed = React.memo(
  FeedTree,
  (prevProps: OwnProps, nextProps: OwnProps) =>
    isEqual(prevProps.data, nextProps.data) &&
    prevProps.zoom === nextProps.zoom &&
    isEqual(prevProps.tsIds, nextProps.tsIds),
);

export default FeedTreeMemoed;
