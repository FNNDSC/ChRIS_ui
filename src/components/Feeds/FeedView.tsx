import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { Tooltip } from "@patternfly/react-core";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Typography } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { elipses } from "../../api/common";
import type { IDrawerState } from "../../store/drawer/drawerSlice";
import { resetDrawerState } from "../../store/drawer/drawerSlice";
import { clearSelectedFile } from "../../store/explorer/explorerSlice";
import {
  getFeedSuccess,
  resetFeed,
  setShowToolbar,
} from "../../store/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchPluginInstances,
  getSelectedPlugin,
  resetPluginInstances,
} from "../../store/pluginInstance/pluginInstanceSlice";
import { resetActiveResources } from "../../store/resources/resourceSlice";
import type { DestroyActiveResources } from "../../store/resources/types";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/ParentComponent";
import { CodeBranchIcon } from "../Icons";
import NodeDetails from "../NodeDetails/NodeDetails";
import WrapperConnect from "../Wrapper";
import { DrawerActionButton } from "./DrawerUtils";
import { useFetchFeed } from "./useFetchFeed";
import { useSearchQueryParams } from "./usePaginate";
import { handleMaximize, handleMinimize } from "./utilties";
import "./Feeds.css"; // Import your CSS file

const { Title } = Typography;

const FeedView: React.FC = () => {
  const drawerState = useAppSelector((state) => state.drawers);
  const { currentLayout } = useAppSelector((state) => state.feed);
  const dispatch = useAppDispatch();
  const query = useSearchQueryParams();
  const type = query.get("type");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const { selectedPlugin, pluginInstances } = useAppSelector(
    (state) => state.instance,
  );
  const dataRef = useRef<DestroyActiveResources>();
  dataRef.current = {
    data: pluginInstances.data,
    selectedPlugin,
  };
  const { feed, contextHolder } = useFetchFeed(id, type, isLoggedIn);

  useEffect(() => {
    if (!type || (type === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [type, isLoggedIn, location, navigate]);

  useEffect(() => {
    if (feed) {
      dispatch(getFeedSuccess(feed as Feed));
      dispatch(fetchPluginInstances(feed));
    }
  }, [feed, dispatch]);

  useEffect(() => {
    document.title = "My Analyses - CHRIS UI";
    dispatch(setShowToolbar(true));
    return () => {
      if (dataRef.current?.selectedPlugin && dataRef.current.data) {
        dispatch(resetActiveResources(dataRef.current));
      }
      dispatch(resetPluginInstances());
      dispatch(resetFeed());
      dispatch(clearSelectedFile());
      dispatch(resetDrawerState());
      dispatch(setShowToolbar(false));
    };
  }, [dispatch]);

  const onNodeClick = useCallback(
    (node: any) => {
      dispatch(clearSelectedFile());
      dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  const onNodeBrowserClick = useCallback(
    (node: PluginInstance) => {
      dispatch(clearSelectedFile());
      dispatch(getSelectedPlugin(node));
    },
    [dispatch],
  );

  const handleDrawerAction = useCallback(
    (mode: keyof IDrawerState) => (
      <DrawerActionButton
        content={mode}
        handleMaximize={() => handleMaximize(mode, dispatch)}
        handleMinimize={() => handleMinimize(mode, dispatch)}
        maximized={drawerState[mode].maximized}
      />
    ),
    [drawerState, dispatch],
  );

  const TitleComponent = (
    <Title level={4} style={{ marginBottom: 0, color: "white" }}>
      <CodeBranchIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={feed?.data.name}>
        <span>{feed ? elipses(feed?.data.name, 40) : ""}</span>
      </Tooltip>
    </Title>
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      {contextHolder}
      <PanelGroup direction="vertical">
        {/* Top Panels: Graph and Node Details */}
        <Panel className="custom-panel" defaultSize={54} minSize={20}>
          <PanelGroup direction="horizontal">
            {/* Left Panel: Graph */}
            <Panel defaultSize={drawerState.node.open ? 53 : 100} minSize={20}>
              {handleDrawerAction("graph")}
              {!currentLayout ? (
                <ParentComponent onNodeClick={onNodeClick} />
              ) : (
                <FeedGraph onNodeClick={onNodeClick} />
              )}
            </Panel>

            {/* Horizontal Resize Handle */}
            {drawerState.node.open && (
              <PanelResizeHandle className="ResizeHandle" />
            )}

            {/* Right Panel: Node Details */}
            {drawerState.node.open && (
              <Panel className="custom-panel" defaultSize={47} minSize={20}>
                {handleDrawerAction("node")}
                <div className="node-block">
                  <NodeDetails />
                </div>
              </Panel>
            )}
          </PanelGroup>
        </Panel>

        {/* Vertical Resize Handle */}
        {(drawerState.preview.open || drawerState.files.open) && (
          <PanelResizeHandle className="ResizeHandleVertical" />
        )}

        {/* Bottom Panel: Feed Output Browser */}
        <Panel className="custom-panel" defaultSize={44} minSize={20}>
          <FeedOutputBrowser
            explore={true}
            handlePluginSelect={onNodeBrowserClick}
          />
        </Panel>
      </PanelGroup>
    </WrapperConnect>
  );
};

export default React.memo(FeedView);
