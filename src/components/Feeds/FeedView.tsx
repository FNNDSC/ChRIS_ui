import * as React from "react";
import { useParams } from "react-router";
import {
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
} from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../store/hooks";
import { DrawerActionButton } from "./DrawerUtils";
import { handleClose, handleMaximize, handleMinimize } from "./utilties";
import type { DestroyActiveResources } from "../../store/resources/types";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions";
import {
  setShowToolbar,
  getFeedRequest,
  resetFeed,
} from "../../store/feed/actions";
import {
  getSelectedD3Node,
  getSelectedPlugin,
  resetPluginInstances,
} from "../../store/pluginInstance/actions";
import { clearSelectedFile } from "../../store/explorer/actions";
import { addTSNodes, resetTsNodes } from "../../store/tsplugins/actions";
import ParentComponent from "../FeedTree/ParentComponent";
import type { PluginInstance } from "@fnndsc/chrisapi";
import FeedGraph from "../FeedTree/FeedGraph";
import NodeDetails from "../NodeDetails/NodeDetails";
import WrapperConnect from "../Wrapper";
import { resetActiveResources } from "../../store/resources/actions";
import FeedOutputBrowser from "../FeedOutputBrowser/FeedOutputBrowser";

export default function FeedView() {
  const params = useParams();
  const dispatch = useDispatch();
  const { id } = params;
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin,
  );
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
      }),
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
          handleClose={() => {
            handleClose("graph", dispatch);
          }}
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
