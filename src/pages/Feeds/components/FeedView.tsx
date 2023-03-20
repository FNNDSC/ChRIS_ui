import * as React from "react";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { PluginInstance } from "@fnndsc/chrisapi";
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
import { useTypedSelector } from "../../../store/hooks";
import { FeedDetails } from "../../../components";
import { SpinContainer } from "../../../components/common/loading/LoadingContent";
import { getFeedRequest, resetFeed } from "../../../store/feed/actions";
import {
  getSelectedD3Node,
  getSelectedPlugin,
  resetPluginInstances,
} from "../../../store/pluginInstance/actions";
import { setSidebarActive } from "../../../store/ui/actions";
import { addTSNodes, resetTsNodes } from "../../../store/tsplugins/actions";

import { resetActiveResources } from "../../../store/resources/actions";
import { setIsNavOpen } from "../../../store/ui/actions";
import { DestroyActiveResources } from "../../../store/resources/types";
import { LoadingErrorAlert } from "../../../components/common/errorHandling";
import {
  DrawerActionButton,
  handleClose,
  handleMaximize,
  handleMinimize,
} from "../../../components/common/button";

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
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );
  const dataRef = React.useRef<DestroyActiveResources>();
  const { data } = pluginInstances;
  const drawerState = useTypedSelector((state) => state.drawers);

  dataRef.current = {
    data,
    selectedPlugin,
  };

  React.useEffect(() => {
    return () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        handleClose("node", dispatch);
        handleClose("directory", dispatch);
        handleClose("files", dispatch);
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (
        dataRef.current &&
        dataRef.current.selectedPlugin &&
        dataRef.current.data
      ) {
        dispatch(resetActiveResources(dataRef.current));
      }

      dispatch(resetPluginInstances());
      dispatch(resetTsNodes());
      dispatch(resetFeed());
    };
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(setIsNavOpen(false));
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

  const onNodeClick = (node: any) => {
    dispatch(getSelectedPlugin(node.item));
    dispatch(getSelectedD3Node(node));
  };

  const onNodeBrowserClick = (node: PluginInstance) => {
    dispatch(getSelectedPlugin(node));
  };

  const onNodeClickTS = (node: PluginInstance) => {
    dispatch(addTSNodes(node));
  };

  const feedTree = (
    <ErrorBoundary
      fallback={
        <div>
          <LoadingErrorAlert
            error={{
              message: "Error found in constructing a tree",
            }}
          />
        </div>
      }
    >
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
        <React.Suspense
          fallback={
            <SpinContainer title="Fetching Resources to construct the graph" />
          }
        >
          {!currentLayout ? (
            <ParentComponent
              onNodeClick={onNodeClick}
              onNodeClickTs={onNodeClickTS}
            />
          ) : (
            <FeedGraph onNodeClick={onNodeClick} />
          )}
        </React.Suspense>
      </GridItem>
    </ErrorBoundary>
  );

  const nodePanel = (
    <ErrorBoundary fallback={<div></div>}>
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
          <NodeDetails />
        </React.Suspense>
      </GridItem>
    </ErrorBoundary>
  );

  const feedOutputBrowserPanel = (
    <React.Suspense
      fallback={<SpinContainer title="Fetching feed Resources" />}
    >
      <ErrorBoundary
        fallback={
          <div>
            <LoadingErrorAlert
              error={{
                message: "There was an error while fetching the file",
              }}
            />
          </div>
        }
      >
        <FeedOutputBrowser
          explore={true}
          handlePluginSelect={onNodeBrowserClick}
        />
      </ErrorBoundary>
    </React.Suspense>
  );

  return (
    <React.Fragment>
      <PageSection
        variant="darker"
        className="section-one"
        style={{ height: "auto" }}
      >
        <FeedDetails />
      </PageSection>

      <Drawer
        isExpanded={
          drawerState.preview.open ||
          drawerState.directory.open ||
          drawerState.files.open
        }
        isInline
        position="bottom"
      >
        <DrawerContent
          panelContent={
            <DrawerPanelContent
              defaultSize={
                !drawerState.graph.open && !drawerState.node.open
                  ? "100vh"
                  : "46vh"
              }
              isResizable
            >
              <PageSection variant="darker" className="section-three">
                {feedOutputBrowserPanel}
              </PageSection>
            </DrawerPanelContent>
          }
        >
          <PageSection variant="darker" className="section-two">
            <Grid
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <Drawer isExpanded={drawerState.node.open} isInline>
                <DrawerContent
                  panelContent={
                    <DrawerPanelContent
                      className="drawer-panel"
                      defaultSize={
                        drawerState.graph.open === false ? "100%" : "51.5%"
                      }
                      minSize={"25%"}
                      isResizable
                    >
                      <DrawerActionButton
                        background="#001223"
                        content="Node"
                        handleClose={() => {
                          handleClose("node", dispatch);
                        }}
                        handleMaximize={() => {
                          handleMaximize("node", dispatch);
                        }}
                        handleMinimize={() => {
                          handleMinimize("node", dispatch);
                        }}
                      />
                      {nodePanel}
                    </DrawerPanelContent>
                  }
                >
                  <DrawerContentBody>
                    <DrawerActionButton
                      background="#151515"
                      content="Graph"
                      handleClose={() => {
                        handleClose("graph", dispatch);
                      }}
                      handleMaximize={() => {
                        handleMaximize("graph", dispatch);
                      }}
                      handleMinimize={() => {
                        handleMinimize("graph", dispatch);
                      }}
                    />
                    {drawerState.graph.open && feedTree}
                  </DrawerContentBody>
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
