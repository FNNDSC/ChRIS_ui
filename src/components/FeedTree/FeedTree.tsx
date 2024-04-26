import { PluginInstance } from "@fnndsc/chrisapi";
import { Alert, Switch, TextInput } from "@patternfly/react-core";
import {
  HierarchyPointLink,
  HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import { event, select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { isEqual } from "lodash";
import React, { useContext, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setFeedLayout,
  setSearchFilter,
  setTranslate,
} from "../../store/feed/actions";
import type { FeedTreeProp } from "../../store/feed/types";
import { useTypedSelector } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import { RotateLeft, RotateRight } from "../Icons";
import { FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import Link from "./Link";
import NodeWrapper from "./Node";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import TreeNodeDatum, { OwnProps, Point } from "./data";
import useSize from "./useSize";

type FeedTreeState = {
  d3: {
    translate: Point;
    scale: number;
  };
  overlayScale: {
    // overlay of individual nodes based on time or size
    enabled: boolean;
    type: FeedTreeScaleType;
  };
  collapsible: boolean;
  toggleLabel: boolean;
  search: boolean;
};

function calculateD3Geometry(nextProps: OwnProps, feedTreeProp: FeedTreeProp) {
  let scale: any;
  if (nextProps.zoom > nextProps.scaleExtent.max) {
    scale = nextProps.scaleExtent.max;
  } else if (nextProps.zoom < nextProps.scaleExtent.min) {
    scale = nextProps.scaleExtent.min;
  } else {
    scale = nextProps.zoom;
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

const FeedTree = (props: OwnProps) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const divRef = useRef<HTMLDivElement>(null);
  const { feedTreeProp, currentLayout, searchFilter } = useTypedSelector(
    (state) => state.feed,
  );
  const [feedTree, setFeedTree] = React.useState<{
    nodes?: HierarchyPointNode<TreeNodeDatum>[];
    links?: HierarchyPointLink<TreeNodeDatum>[];
  }>({
    nodes: [],
    links: [],
  });
  const size = useSize(divRef);
  const { nodeSize, separation, tsIds } = props;
  const { orientation } = feedTreeProp;

  const generateTree = React.useCallback(
    (data: TreeNodeDatum[]) => {
      const d3Tree = tree<TreeNodeDatum>()
        .nodeSize(
          orientation === "horizontal"
            ? [nodeSize.y, nodeSize.x]
            : [nodeSize.x, nodeSize.y],
        )
        .separation((a, b) => {
          return a.data.parentId === b.data.parentId
            ? separation.siblings
            : separation.nonSiblings;
        });

      let nodes: HierarchyPointNode<TreeNodeDatum>[] | undefined = undefined;
      let links: HierarchyPointLink<TreeNodeDatum>[] | undefined = undefined;
      let newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

      if (data) {
        const rootNode = d3Tree(
          hierarchy(data[0], (d) => (d.__rd3t.collapsed ? null : d.children)),
        );
        nodes = rootNode.descendants();
        links = rootNode.links();

        const newLinksToAdd = [];

        if (tsIds) {
          for (const link of links) {
            // Extract target and source IDs from the link
            const targetId = link.target.data.id;
            const sourceId = link.target.data.id; // Corrected to use link.target.data.id

            // Check if targetId and sourceId exist and if at least one of them is in 'tsIds'
            if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
              // 'tsPlugin' found

              // Determine the topological link based on 'tsIds'
              let topologicalLink: any;

              if (tsIds[targetId]) {
                topologicalLink = link.target;
              } else {
                topologicalLink = link.source;
              }

              // Get the parents from 'tsIds'
              const parents = tsIds[topologicalLink.data.id];

              // Create a dictionary to store unique source and target nodes
              const dict: { [key: string]: any } = {};

              // Iterate over all links to find nodes related to parents
              for (const innerLink of links) {
                for (let i = 0; i < parents.length; i++) {
                  // Check if the source ID matches any parent and it is not already in the dictionary
                  if (
                    innerLink.source.data.id === parents[i] &&
                    !dict[innerLink.source.data.id]
                  ) {
                    dict[innerLink.source.data.id] = innerLink.source;
                  }
                  // Check if the target ID matches any parent and it is not already in the dictionary
                  else if (
                    innerLink.target.data.id === parents[i] &&
                    !dict[innerLink.target.data.id]
                  ) {
                    dict[innerLink.target.data.id] = innerLink.target;
                  }
                }
              }

              // Add new links to the array based on the dictionary
              for (const i in dict) {
                newLinksToAdd.push({
                  source: dict[i],
                  target: topologicalLink,
                });
              }
            }
          }
        }

        newLinks = [...links, ...newLinksToAdd];
      }

      return { nodes, newLinks: newLinks };
    },
    [
      nodeSize.x,
      nodeSize.y,
      orientation,
      separation.nonSiblings,
      separation.siblings,
      tsIds,
    ],
  );

  React.useEffect(() => {
    //@ts-ignore
    if (size?.width) {
      //@ts-ignore
      dispatch(setTranslate({ x: size.width / 2, y: 90 }));
    }
  }, [size, dispatch]);

  const mode = useTypedSelector((state) => state.tsPlugins.treeMode);
  const [feedState, setFeedState] = React.useState<FeedTreeState>(
    getInitialState(props, feedTreeProp),
  );

  const { scale } = feedState.d3;
  const { changeOrientation, zoom, scaleExtent } = props;

  const bindZoomListener = React.useCallback(() => {
    const { translate } = feedTreeProp;
    const svg = select(`.${svgClassName}`);
    const g = select(`.${graphClassName}`);

    svg.call(
      //@ts-ignore
      d3Zoom().transform,
      zoomIdentity.translate(translate.x, translate.y).scale(zoom),
    );

    svg.call(
      //@ts-ignore
      d3Zoom()
        .scaleExtent([scaleExtent.min, scaleExtent.max])
        .on("zoom", () => {
          // This event is being imported from the d3 selection library
          g.attr("transform", event.transform);
        }),
    );
  }, [zoom, scaleExtent, feedTreeProp]);

  React.useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  React.useEffect(() => {
    if (props.data) {
      const { nodes, newLinks: links } = generateTree(props.data);
      setFeedTree(() => {
        return {
          nodes,
          links,
        };
      });
    }
  }, [props.data, generateTree]);

  const handleChange = (feature: string, data?: any) => {
    if (feature === "scale_enabled") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          enabled: !feedState.overlayScale.enabled,
        },
      });
    } else if (feature === "scale_type") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          type: data,
        },
      });
    } else {
      setFeedState({
        ...feedState,
        //@ts-ignore
        [feature]: !feedState[feature],
      });
    }
  };

  const handleNodeClick = (item: any) => {
    props.onNodeClick(item);
  };

  const handleNodeClickTs = (item: PluginInstance) => {
    props.onNodeClickTs(item);
  };

  const { nodes, links } = feedTree;

  return (
    <div
      className={`feed-tree setFlex grabbable mode_${
        mode === false ? "graph" : "tree"
      }`}
      ref={divRef}
    >
      <div className="feed-tree__container">
        <div className="feed-tree__container--labels">
          {/* Suppressing this for now as we don't know how which key events to hook for changing orientations */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => {
              changeOrientation(orientation);
            }}
            className="feed-tree__orientation"
          >
            {orientation === "vertical" ? (
              <RotateLeft className="feed-tree__orientation--icon" />
            ) : (
              <RotateRight className="feed-tree__orientation--icon" />
            )}
          </div>

          <div className="feed-tree__control">
            <Switch
              id="labels"
              label="Hide Labels"
              labelOff="Show Labels"
              isChecked={feedState.toggleLabel}
              onChange={() => {
                handleChange("toggleLabel");
              }}
            />
          </div>
          <div className="feed-tree__control">
            <Switch
              id="layout"
              label="Switch Layout"
              labelOff="3D"
              isChecked={currentLayout}
              onChange={() => {
                dispatch(setFeedLayout());
              }}
            />
          </div>

          <div className="feed-tree__control feed-tree__individual-scale">
            <Switch
              id="individual-scale"
              label="Scale Nodes On"
              labelOff="Scale Nodes Off "
              isChecked={feedState.overlayScale.enabled}
              onChange={() => {
                handleChange("scale_enabled");
              }}
            />

            {feedState.overlayScale.enabled && (
              <div className="dropdown-wrap">
                <NodeScaleDropdown
                  selected={feedState.overlayScale.type}
                  onChange={(type) => {
                    handleChange("scale_type", type);
                  }}
                />
              </div>
            )}
          </div>
          <div className="feed-tree__control">
            <Switch
              id="search"
              label="Search On"
              labelOff="Search Off "
              isChecked={feedState.search}
              onChange={() => {
                handleChange("search");
              }}
            />
          </div>

          <div className="feed-tree__control">
            {feedState.search && (
              <TextInput
                value={searchFilter.value}
                onChange={(_event, value: string) => {
                  dispatch(setSearchFilter(value.trim()));
                }}
              />
            )}
          </div>

          {mode === false && (
            <div className="feed-tree__orientation">
              <Alert
                variant="info"
                title="You are now in a ts node selection mode"
              />
            </div>
          )}
        </div>
      </div>

      {feedTreeProp.translate.x > 0 && feedTreeProp.translate.y > 0 && (
        // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
        <svg
          focusable="true"
          className={`${svgClassName}`}
          width="100%"
          height="100%"
        >
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${feedTreeProp.translate.x},${feedTreeProp.translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => {
              return (
                <Link
                  orientation={orientation}
                  key={`link${i}`}
                  linkData={linkData}
                  isDarkTheme={isDarkTheme}
                />
              );
            })}

            {nodes?.map(({ data, x, y, parent }, i) => {
              return (
                <NodeWrapper
                  key={`node + ${data.id}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  onNodeClick={handleNodeClick}
                  onNodeClickTs={handleNodeClickTs}
                  orientation={orientation}
                  toggleLabel={feedState.toggleLabel}
                  overlayScale={
                    feedState.overlayScale.enabled
                      ? feedState.overlayScale.type
                      : undefined
                  }
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      )}
    </div>
  );
};

const FeedTreeMemoed = React.memo(
  FeedTree,
  (prevProps: OwnProps, nextProps: OwnProps) => {
    if (
      !isEqual(prevProps.data, nextProps.data) ||
      prevProps.zoom !== nextProps.zoom ||
      prevProps.tsIds !== nextProps.tsIds
    ) {
      return false;
    }
    return true;
  },
);

export default FeedTreeMemoed;

FeedTree.defaultProps = {
  scaleExtent: { min: 0.1, max: 1.5 },
  zoom: 1,
  nodeSize: { x: 120, y: 80 },
};
