import * as React from "react";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { PluginInstance } from "@fnndsc/chrisapi";
import { useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from "@patternfly/react-core";
import { useTypedSelector } from "../../../store/hooks";
import { SpinContainer } from "../../../components/common/loading/LoadingContent";
import {
  getFeedRequest,
  resetFeed,
  setShowToolbar,
} from "../../../store/feed/actions";
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
import { clearSelectedFile } from "../../../store/explorer/actions";

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
  const { currentLayout } = useTypedSelector((state) => state.feed);
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
  }, [dispatch]);

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
      dispatch(clearSelectedFile());
      dispatch(setShowToolbar(false));
    };
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(setIsNavOpen(false));
    dispatch(setShowToolbar(true));
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

  const handleDrawerAction = (mode: string) => {
    return (
      <DrawerActionButton
        background="#001223"
        content={mode}
        handleClose={() => {
          handleClose(mode, dispatch);
        }}
        handleMaximize={() => {
          handleMaximize(mode, dispatch);
        }}
        handleMinimize={() => {
          handleMinimize(mode, dispatch);
        }}
      />
    );
  };

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
    </ErrorBoundary>
  );

  const nodePanel = (
    <ErrorBoundary
      fallback={
        <div>
          <div>
            <LoadingErrorAlert
              error={{
                message: "Error found in fetching resources for this panel",
              }}
            />
          </div>
        </div>
      }
    >
      <div className="node-block">
        {" "}
        <React.Suspense
          fallback={
            <SpinContainer title="Fetching Selected Plugin Instance's details" />
          }
        >
          <NodeDetails />
        </React.Suspense>
      </div>
    </ErrorBoundary>
  );

  const inlineDrawer = (
    <Drawer isInline position="right" isExpanded={drawerState.node.open}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            defaultSize={drawerState.graph.open === false ? "100%" : "47%"}
            isResizable
          >
            {handleDrawerAction("node")}
            {nodePanel}
          </DrawerPanelContent>
        }
      >
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
        <DrawerContentBody>
          {drawerState["graph"].open && feedTree}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <React.Fragment>
      <Drawer
        isInline
        position="bottom"
        isExpanded={
          drawerState.preview.open ||
          drawerState.directory.open ||
          drawerState.files.open
        }
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
              {feedOutputBrowserPanel}
            </DrawerPanelContent>
          }
        >
          {inlineDrawer}
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default FeedView;
