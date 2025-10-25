import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { Tooltip } from "@patternfly/react-core";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation, useNavigate, useParams } from "react-router";
import { elipses } from "../../api/common";
import { useAppDispatch } from "../../store/hooks";
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
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { collectionJsonToJson } from "../../api/api";
import {
  PkgInstanceStatus,
  type PkgInstance as PluginInstanceType,
} from "../../api/types";
import * as DoDrawer from "../../reducers/drawer";
import type * as DoExplorer from "../../reducers/explorer";
import type * as DoFeed from "../../reducers/feed";
import { Role } from "../../reducers/types";
import type * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import CustomTitle from "./CustomTitle";
import { useFetchFeed } from "./useFetchFeed";
import { useSearchQueryParams } from "./usePaginate";
import { usePollAllPluginStatuses } from "./usePolledStatuses";
import { onMaximize, onMinimize } from "./utilties";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoExplorer = ThunkModuleToFunc<typeof DoExplorer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useExplorer: UseThunk<DoExplorer.State, TDoExplorer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const { useUI, useUser, useDrawer, useExplorer, useFeed } = props;

  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { role, isLoggedIn, isInit, isStaff } = user;

  const [classStateDrawer, doDrawer] = useDrawer;
  const drawerState = getState(classStateDrawer) || DoDrawer.defaultState;
  const drawerID = getRootID(classStateDrawer);

  const [classStateExplorer, doExplorer] = useExplorer;
  const explorerID = getRootID(classStateExplorer);

  const [classStateFeed, doFeed] = useFeed;
  const feedID = getRootID(classStateFeed);

  const [currentLayout, setCurrentLayout] = useState(false);
  const dispatch = useAppDispatch();
  const query = useSearchQueryParams();
  const theType = query.get("type");
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = params;

  const { feed, contextHolder } = useFetchFeed(id, theType, isLoggedIn, isInit);
  const treeQuery = usePaginatedTreeQuery(feed);
  const statuses = usePollAllPluginStatuses(
    treeQuery.pluginInstances,
    treeQuery.totalCount,
  );

  useEffect(() => {
    if (!isInit) {
      return;
    }

    if (!theType || (theType === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(
        `${location.pathname}${location.search}`,
      );
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [theType, isLoggedIn, isInit, location, navigate]);

  // init
  useEffect(() => {
    document.title = "My Analyses - CHRIS UI";
    doFeed.setShowToolbar(feedID, true);
    return () => {
      dispatch(resetSelectedPlugin());
      doExplorer.clearSelectedFile(explorerID);
      doFeed.setShowToolbar(feedID, false);
    };
  }, [dispatch, isInit]);

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

    const isSuccess = lastPluginInstance.status === PkgInstanceStatus.SUCCESS;

    const theRole = role || Role.DefaultRole;
    doDrawer.resetDrawerState(drawerID, theRole, isSuccess);
    return () => {
      const theRole = role || Role.DefaultRole;
      doDrawer.resetDrawerState(drawerID, theRole, isSuccess);
    };
  }, [dispatch, role, treeQuery.pluginInstances, treeQuery.totalCount]);

  useEffect(() => {
    if (!feed) {
      return;
    }
    doFeed.feedSuccess(feedID, feed);
  }, [dispatch, feed]);

  const onNodeClick = useCallback(
    (node: any) => {
      doExplorer.clearSelectedFile(explorerID);
      dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  const onNodeBrowserClick = useCallback(
    (node: PluginInstance) => {
      console.info("onNodeBrowserClick: start: node:", node);
      doExplorer.clearSelectedFile(explorerID);
      dispatch(getSelectedPlugin(node));
    },
    [dispatch],
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
    <Wrapper
      useUI={useUI}
      useUser={useUser}
      useDrawer={useDrawer}
      useFeed={useFeed}
      title={TitleComponent}
    >
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
                  <DrawerActionButton
                    content={"graph"}
                    onMaximize={() => onMaximize(drawerID, "graph", doDrawer)}
                    onMinimize={() => onMinimize(drawerID, doDrawer)}
                    maximized={drawerState.graph.maximized}
                  />
                  {!currentLayout ? (
                    <ParentComponent
                      changeLayout={changeLayout}
                      currentLayout={currentLayout}
                      treeQuery={treeQuery}
                      statuses={statuses}
                      feed={feed}
                      isStaff={isStaff}
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
                <DrawerActionButton
                  content={"node"}
                  onMaximize={() => onMaximize(drawerID, "node", doDrawer)}
                  onMinimize={() => onMinimize(drawerID, doDrawer)}
                  maximized={drawerState.node.maximized}
                />
                <div className="node-block">
                  <NodeDetails useDrawer={useDrawer} useFeed={useFeed} />
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
            useUser={useUser}
            useDrawer={useDrawer}
            useExplorer={useExplorer}
            useFeed={useFeed}
          />
        </Panel>
      </PanelGroup>
    </Wrapper>
  );
};
