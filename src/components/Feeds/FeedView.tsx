import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { Tooltip } from "@patternfly/react-core";
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";
import { elipses } from "../../api/common";
import type { IDrawerState } from "../../store/drawer/drawerSlice";
import { resetDrawerState } from "../../store/drawer/drawerSlice";
import { clearSelectedFile } from "../../store/explorer/explorerSlice";
import { getFeedSuccess, setShowToolbar } from "../../store/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getSelectedPlugin,
  resetSelectedPlugin,
} from "../../store/pluginInstance/pluginInstanceSlice";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";
import FeedGraph from "../FeedTree/FeedGraph";
import ParentComponent from "../FeedTree/ParentComponent";
import { AnalysisIcon } from "../Icons";
import NodeDetails from "../NodeDetails/NodeDetails";
import Wrapper from "../Wrapper";
import { DrawerActionButton } from "./DrawerUtils";
import usePaginatedTreeQuery from "./usePaginatedTreeQuery";
import "./Feeds.css"; // Import your CSS file
import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { collectionJsonToJson } from "../../api/api";
import {
  PluginInstanceStatus,
  type PluginInstance as PluginInstanceType,
} from "../../api/types";
import type * as DoUI from "../../reducers/ui";
import { Role } from "../../store/user/userSlice";
import { useFetchFeed } from "./useFetchFeed";
import { useSearchQueryParams } from "./usePaginate";
import { usePollAllPluginStatuses } from "./usePolledStatuses";
import { handleMaximize, handleMinimize } from "./utilties";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

// Custom title component to replace Typography.Title
const CustomTitle = ({
  // @ts-expect-error children as any
  children,
  color = "inherit",
  className = "",
  style = {},
}) => (
  <h4
    className={`custom-title ${className}`}
    style={{
      margin: 0,
      marginBottom: 0,
      color,
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: "1.4",
      ...style,
    }}
  >
    {children}
  </h4>
);

export default (props: Props) => {
  const { useUI } = props;
  const [currentLayout, setCurrentLayout] = useState(false);
  const drawerState = useAppSelector((state) => state.drawers);
  const dispatch = useAppDispatch();
  const query = useSearchQueryParams();
  const theType = query.get("type");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const role = useAppSelector((state) => state.user.role);
  const { feed, contextHolder } = useFetchFeed(id, theType, isLoggedIn);
  const treeQuery = usePaginatedTreeQuery(feed);
  const statuses = usePollAllPluginStatuses(
    treeQuery.pluginInstances,
    treeQuery.totalCount,
  );
  useEffect(() => {
    if (!theType || (theType === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [theType, isLoggedIn, location, navigate]);

  // init
  useEffect(() => {
    document.title = "My Analyses - CHRIS UI";
    dispatch(setShowToolbar(true));
    return () => {
      dispatch(resetSelectedPlugin());
      dispatch(clearSelectedFile());
      dispatch(setShowToolbar(false));
    };
  }, [dispatch]);

  // set drawer state
  useEffect(() => {
    if (!treeQuery.totalCount) {
      return;
    }
    if (treeQuery.totalCount !== treeQuery.pluginInstances.length) {
      return;
    }

    const lastPluginInstance: PluginInstanceType = collectionJsonToJson(
      treeQuery.pluginInstances[treeQuery.pluginInstances.length - 1],
    );

    const isSuccess =
      lastPluginInstance.status === PluginInstanceStatus.SUCCESS;

    const theRole = role || Role.DefaultRole;
    dispatch(resetDrawerState({ role: theRole, isSuccess }));
    return () => {
      const theRole = role || Role.DefaultRole;
      dispatch(resetDrawerState({ role: theRole, isSuccess }));
    };
  }, [dispatch, role, treeQuery.pluginInstances, treeQuery.totalCount]);

  useEffect(() => {
    if (!feed) {
      return;
    }
    dispatch(getFeedSuccess(feed as Feed));
  }, [dispatch, feed]);

  const onNodeClick = useCallback(
    (node: any) => {
      console.info("onNodeClick: node:", node);
      dispatch(clearSelectedFile());
      dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  const onNodeBrowserClick = useCallback(
    (node: PluginInstance) => {
      console.info("onNodeBrowserClick: start: node:", node);
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

  const changeLayout = () => {
    setCurrentLayout(!currentLayout);
  };

  const TitleComponent = (
    <CustomTitle color="white">
      <AnalysisIcon style={{ marginRight: "0.25em" }} />
      <Tooltip content={feed?.data.name}>
        <span>{feed ? elipses(feed?.data.name, 40) : ""}</span>
      </Tooltip>
    </CustomTitle>
  );

  const isUpperShow = drawerState.graph.open || drawerState.node.open;
  const upperStyle: CSSProperties = {};
  if (!isUpperShow) {
    upperStyle.display = "none";
  }

  const graphStyle: CSSProperties = {};
  if (!drawerState.graph.open) {
    graphStyle.display = "none";
  }

  const nodeStyle: CSSProperties = {
    overflow: "scroll",
  };
  if (!drawerState.node.open) {
    nodeStyle.display = "none";
  }

  const feedOutputBrowserStyle: CSSProperties = {};
  if (!drawerState.files.open && !drawerState.preview.open) {
    feedOutputBrowserStyle.display = "none";
  }

  return (
    <Wrapper useUI={useUI} titleComponent={TitleComponent}>
      {contextHolder}
      <PanelGroup autoSaveId="conditional" direction="vertical">
        {/* Top Panels: Graph and Node Details */}
        <>
          <Panel
            className="custom-panel"
            id="1"
            order={1}
            defaultSize={50}
            minSize={20}
            style={upperStyle}
          >
            <PanelGroup autoSaveId="conditional" direction="horizontal">
              {/* Left Panel: Graph */}
              <>
                <Panel
                  className="custom-panel"
                  order={1}
                  defaultSize={53}
                  minSize={20}
                  style={graphStyle}
                >
                  {handleDrawerAction("graph")}
                  {!currentLayout ? (
                    <ParentComponent
                      changeLayout={changeLayout}
                      currentLayout={currentLayout}
                      treeQuery={treeQuery}
                      statuses={statuses}
                      feed={feed}
                    />
                  ) : (
                    <FeedGraph
                      currentLayout={currentLayout}
                      changeLayout={changeLayout}
                      onNodeClick={onNodeClick}
                      feed={feed}
                    />
                  )}
                </Panel>
                <PanelResizeHandle className="ResizeHandle" />
              </>

              {/* Right Panel: Node Details */}
              <Panel
                className="custom-panel"
                id="2"
                order={2}
                defaultSize={47}
                minSize={20}
                style={nodeStyle}
              >
                {handleDrawerAction("node")}
                <div className="node-block">
                  <NodeDetails />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="ResizeHandleVertical" />
        </>

        {/* Vertical Resize Handle */}

        {/* Bottom Panel: Feed Output Browser */}
        <Panel
          className="custom-panel"
          id="3"
          order={2}
          defaultSize={50}
          minSize={20}
          style={feedOutputBrowserStyle}
        >
          <FeedOutputBrowser
            explore={true}
            handlePluginSelect={onNodeBrowserClick}
            statuses={statuses}
          />
        </Panel>
      </PanelGroup>
    </Wrapper>
  );
};
