import * as React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import {
  PageSection,
  Grid,
  GridItem,
  Skeleton,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from "@patternfly/react-core";
import classNames from "classnames";
import { FeedDetails } from "../../../components";
import { getFeedRequest, resetFeed } from "../../../store/feed/actions";
import {
  getSelectedPlugin,
  resetPluginInstances,
} from "../../../store/pluginInstance/actions";
import { setSidebarActive } from "../../../store/ui/actions";
import { addTSNodes, resetTsNodes } from "../../../store/tsplugins/actions";
import { destroyExplorer } from "../../../store/explorer/actions";
import { resetActiveResources } from "../../../store/resources/actions";
import { RouteComponentProps } from "react-router-dom";
import { PluginInstance } from "@fnndsc/chrisapi";
import { DestroyActiveResources } from "../../../store/resources/types";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";

import "antd/dist/antd.css";

const ParentComponent = React.lazy(
  () => import("../../../components/feed/FeedTree/ParentComponent")
);
const FeedGraph = React.lazy(
  () => import("../../../components/feed/FeedTree/FeedGraph")
);
const FeedOutputBrowser = React.lazy(
  () => import("../../../components/feed/FeedOutputBrowser/FeedOutputBrowser")
);
const NodeDetails = React.lazy(
  () => import("../../../components/feed/NodeDetails/NodeDetails")
);

export type FeedViewProps = RouteComponentProps<{ id: string }>;

export const FeedView: React.FC<FeedViewProps> = ({
  match: {
    params: { id },
  },
}: FeedViewProps) => {
  const [isSidePanelExpanded, setSidePanelExpanded] = React.useState(true);
  const [isBottomPanelExpanded, setBottomPanelExpanded] = React.useState(true);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );

  const dispatch = useDispatch();

  const dataRef = React.useRef<DestroyActiveResources>();
  const { data } = pluginInstances;

  dataRef.current = {
    data,
    selectedPlugin,
  };

  React.useEffect(() => {
    return () => {
      if (
        dataRef.current &&
        dataRef.current.selectedPlugin &&
        dataRef.current.data
      ) {
        dispatch(resetActiveResources(dataRef.current));
      }

      dispatch(destroyExplorer());
      dispatch(resetPluginInstances());
      dispatch(resetTsNodes());
      dispatch(resetFeed());
    };
  }, [dispatch]);

  React.useEffect(() => {
    document.title = "My Analyses - ChRIS UI site";
    dispatch(
      setSidebarActive({
        activeItem: "analyses",
      })
    );
    dispatch(getFeedRequest(id));
  }, [id, dispatch]);

  const onNodeClick = (node: PluginInstance) => {
    dispatch(getSelectedPlugin(node));
    dispatch(destroyExplorer());
  };

  const onNodeClickTS = (node: PluginInstance) => {
    dispatch(addTSNodes(node));
  };

  const onClick = (panel: string) => {
    if (panel === "side_panel") {
      setSidePanelExpanded(!isSidePanelExpanded);
    } else if (panel === "bottom_panel") {
      setBottomPanelExpanded(!isBottomPanelExpanded);
    }
  };

  const feedTree = (
    <GridItem
      className="feed-block"
      sm={12}
      smRowSpan={12}
      md={6}
      mdRowSpan={12}
      lg={6}
      lgRowSpan={12}
      xl={7}
      xlRowSpan={12}
      xl2={7}
      xl2RowSpan={12}
    >
      {" "}
      <React.Suspense fallback={<div>Fetching the Resources in a moment</div>}>
        {currentLayout ? (
          <ParentComponent
            isSidePanelExpanded={isSidePanelExpanded}
            isBottomPanelExpanded={isBottomPanelExpanded}
            onExpand={onClick}
            onNodeClick={onNodeClick}
            onNodeClickTs={onNodeClickTS}
            instances={pluginInstances.data}
          />
        ) : (
          <FeedGraph
            onNodeClick={onNodeClick}
            isSidePanelExpanded={isSidePanelExpanded}
            isBottomPanelExpanded={isBottomPanelExpanded}
            onExpand={onClick}
          />
        )}
      </React.Suspense>
    </GridItem>
  );

  const nodePanel = (
    <GridItem
      sm={12}
      smRowSpan={12}
      md={6}
      mdRowSpan={12}
      lg={6}
      lgRowSpan={12}
      xl={5}
      xlRowSpan={12}
      xl2={5}
      xl2RowSpan={12}
      className="node-block"
    >
      {" "}
      <React.Suspense
        fallback={
          <Skeleton
            height="75%"
            width="75%"
            screenreaderText="Loading Node details"
          />
        }
      >
        <NodeDetails expandDrawer={onClick} />
      </React.Suspense>
    </GridItem>
  );

  const feedOutputBrowserPanel = (
    <React.Suspense
      fallback={
        <Skeleton
          height="100%"
          width="100%"
          screenreaderText="Fetching Plugin Resources"
        />
      }
    >
      <FeedOutputBrowser
        expandDrawer={onClick}
        handlePluginSelect={onNodeClick}
      />
    </React.Suspense>
  );

  return (
    <React.Fragment>
      <PageSection hasShadowBottom variant="darker" className="section-one">
        <FeedDetails />
      </PageSection>

      <Drawer isExpanded={isBottomPanelExpanded} isInline position="bottom">
        <DrawerContent
          panelContent={
            <DrawerPanelContent defaultSize="46vh" isResizable>
              <PageSection className="section-three">
                {feedOutputBrowserPanel}
              </PageSection>
            </DrawerPanelContent>
          }
        >
          <PageSection
            className={classNames(
              pf4UtilityStyles.spacingStyles.p_0,
              "section-two"
            )}
          >
            <Grid
              style={{
                height: "100%",
              }}
            >
              <Drawer isExpanded={isSidePanelExpanded} isInline>
                <DrawerContent
                  panelContent={
                    <DrawerPanelContent
                      defaultSize="50%"
                      minSize={"20%"}
                      isResizable
                    >
                      {nodePanel}
                    </DrawerPanelContent>
                  }
                >
                  <DrawerContentBody> {feedTree}</DrawerContentBody>
                </DrawerContent>
              </Drawer>
            </Grid>
          </PageSection>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default FeedView;
