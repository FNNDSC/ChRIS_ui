import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router";
import { clearSelectedFile } from "../../store/explorer/actions";
import {
  getFeedSuccess,
  resetFeed,
  setShowToolbar,
} from "../../store/feed/actions";
import { useTypedSelector } from "../../store/hooks";
import {
  getPluginInstancesRequest,
  getSelectedD3Node,
  getSelectedPlugin,
  resetPluginInstances,
} from "../../store/pluginInstance/actions";
import { resetActiveResources } from "../../store/resources/actions";
import type { DestroyActiveResources } from "../../store/resources/types";
import { addTSNodes, resetTsNodes } from "../../store/tsplugins/actions";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/ParentComponent";
import NodeDetails from "../NodeDetails/NodeDetails";
import WrapperConnect from "../Wrapper";
import { DrawerActionButton } from "./DrawerUtils";
import { useSearchQueryParams } from "./usePaginate";
import {
  fetchAuthenticatedFeed,
  fetchPublicFeed,
  handleMaximize,
  handleMinimize,
} from "./utilties";

export default function FeedView() {
  const query = useSearchQueryParams();
  const type = query.get("type");

  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin,
  );

  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const { currentLayout } = useTypedSelector((state) => state.feed);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  );
  const dataRef = React.useRef<DestroyActiveResources>();
  const { data } = pluginInstances;
  const drawerState = useTypedSelector((state) => state.drawers);

  dataRef.current = {
    data,
    selectedPlugin,
  };

  const { data: publicFeed } = useQuery({
    queryKey: ["publicFeed", id],
    queryFn: () => fetchPublicFeed(id),
    enabled: type === "public",
  });

  const { data: privateFeed } = useQuery({
    queryKey: ["authenticatedFeed", id],
    queryFn: () => fetchAuthenticatedFeed(id),
    enabled: type === "private" && isLoggedIn,
  });

  React.useEffect(() => {
    if (!type || (type === "private" && !isLoggedIn)) {
      navigate(`/login?redirectTo=${location.pathname}${location.search}`);
    }
  }, [type, navigate, isLoggedIn]);

  React.useEffect(() => {
    const feed: Feed | undefined = privateFeed || publicFeed;
    if (feed) {
      dispatch(getFeedSuccess(feed as Feed));
      dispatch(getPluginInstancesRequest(feed));
    }
  }, [privateFeed, publicFeed, dispatch]);

  React.useEffect(() => {
    return () => {
      if (dataRef.current?.selectedPlugin && dataRef.current.data) {
        dispatch(resetActiveResources(dataRef.current));
      }
      dispatch(resetFeed());
      dispatch(resetPluginInstances());
      dispatch(resetTsNodes());
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
      }),
    );
  }, [dispatch]);

  const onNodeClick = (node: any) => {
    dispatch(clearSelectedFile());
    dispatch(getSelectedPlugin(node.item));
    dispatch(getSelectedD3Node(node));
  };

  const onNodeBrowserClick = (node: PluginInstance) => {
    dispatch(clearSelectedFile());
    dispatch(getSelectedPlugin(node));
  };

  const onNodeClickTS = (node: PluginInstance) => {
    dispatch(addTSNodes(node));
  };

  const handleDrawerAction = (mode: string) => {
    return (
      <DrawerActionButton
        content={mode}
        handleMaximize={() => {
          handleMaximize(mode, dispatch);
        }}
        handleMinimize={() => {
          handleMinimize(mode, dispatch);
        }}
        maximized={drawerState[mode].maximized}
      />
    );
  };

  const feedTreeAndGraph = (
    <Drawer isInline position="right" isExpanded={drawerState.node.open}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            defaultSize={drawerState.graph.open === false ? "100%" : "47%"}
            isResizable
          >
            {handleDrawerAction("node")}
            <div className="node-block">
              <NodeDetails />
            </div>
          </DrawerPanelContent>
        }
      >
        <DrawerActionButton
          content="Graph"
          handleMaximize={() => {
            handleMaximize("graph", dispatch);
          }}
          handleMinimize={() => {
            handleMinimize("graph", dispatch);
          }}
          maximized={drawerState["graph"].maximized}
        />

        <DrawerContentBody>
          {!currentLayout ? (
            <ParentComponent
              onNodeClick={onNodeClick}
              onNodeClickTs={onNodeClickTS}
            />
          ) : (
            <FeedGraph onNodeClick={onNodeClick} />
          )}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <WrapperConnect>
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
              <FeedOutputBrowser
                explore={true}
                handlePluginSelect={onNodeBrowserClick}
              />
            </DrawerPanelContent>
          }
        >
          {feedTreeAndGraph}
        </DrawerContent>
      </Drawer>
    </WrapperConnect>
  );
}
