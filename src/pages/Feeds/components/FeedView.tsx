import * as React from "react";
import { useParams } from "react-router-dom";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import {
  PageSection,
  Grid,
  GridItem,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from "@patternfly/react-core";

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

import { PluginInstance } from "@fnndsc/chrisapi";
import { DestroyActiveResources } from "../../../store/resources/types";
import { SpinContainer } from "../../../components/common/loading/LoadingContent";

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

export const FeedView: React.FC = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { id } = params;
  const [isSidePanelExpanded, setSidePanelExpanded] = React.useState(true);
  const [isBottomPanelExpanded, setBottomPanelExpanded] = React.useState(true);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );

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
    id && dispatch(getFeedRequest(id));
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
        {!currentLayout ? (
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
          <SpinContainer title="Fetching Selected Plugin Instance's details" />
        }
      >
        <NodeDetails expandDrawer={onClick} />
      </React.Suspense>
    </GridItem>
  );

  const feedOutputBrowserPanel = (
    <React.Suspense
      fallback={<SpinContainer title="Fetching feed Resources" />}
    >
      <FeedOutputBrowser
        expandDrawer={onClick}
        handlePluginSelect={onNodeClick}
      />
    </React.Suspense>
  );

  return (
    <React.Fragment>
      <PageSection variant="darker" className="section-one">
        <FeedDetails />
      </PageSection>

      <Drawer isExpanded={isBottomPanelExpanded} isInline position="bottom">
        <DrawerContent
          panelContent={
            <DrawerPanelContent defaultSize="46vh" isResizable>
              <PageSection variant="default" className="section-three">
                {feedOutputBrowserPanel}
              </PageSection>
            </DrawerPanelContent>
          }
        >
          <PageSection className="section-two">
            <Grid
              style={{
                height: "100%",
              }}
            >
              <Drawer isExpanded={isSidePanelExpanded} isInline>
                <DrawerContent
                  panelContent={
                    <DrawerPanelContent
                      defaultSize="48.7%"
                      minSize={"25%"}
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
