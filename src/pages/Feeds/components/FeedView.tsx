import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  Skeleton,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from "@patternfly/react-core";
import classNames from 'classnames';
import { FeedDetails } from "../../../components";

import { setSidebarActive } from "../../../store/ui/actions";
import {
  getFeedRequest,
  getSelectedPlugin,
  destroyPluginState,
} from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import { RouteComponentProps } from "react-router-dom";
import { ApplicationState } from "../../../store/root/applicationState";
import { IFeedState, DestroyData } from "../../../store/feed/types";
import { IUserState } from "../../../store/user/types";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";

const ParentComponent = React.lazy(
  () => import("../../../components/feed/FeedTree/ParentComponent")
);
const FeedGraph = React.lazy(
  () => import("../../../components/feed/FeedTree/FeedGraph")
);

const FeedOutputBrowser = React.lazy(
  () => import("../../../components/feed/FeedOutputBrowser/FeedOutputBrowser")
);

const NodeDetails=React.lazy(()=>import("../../../components/feed/NodeDetails/NodeDetails"))


interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedRequest: typeof getFeedRequest;
  destroyPluginState: typeof destroyPluginState;
  getSelectedPlugin: typeof getSelectedPlugin;
 
}

export type FeedViewProps = IUserState &
  IFeedState &
  IPropsFromDispatch &
  RouteComponentProps<{ id: string }>;

export const FeedView: React.FC<FeedViewProps> = ({
  setSidebarActive,
  match: {
    params: { id },
  },
  getFeedRequest,
  getSelectedPlugin,
  destroyPluginState,
  pluginInstances,
  currentLayout,
  selectedPlugin,
}: FeedViewProps) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const getFeed = React.useCallback(() => {
    getFeedRequest(id);
  }, [id, getFeedRequest]);

  const dataRef = React.useRef<DestroyData>();

  const { data } = pluginInstances;

  dataRef.current = {
    data,
    selectedPlugin: selectedPlugin,
  };

  React.useEffect(() => {
    return () => {
      if (dataRef.current) {
        destroyPluginState(dataRef.current);
      }
    };
  }, [destroyPluginState]);

  React.useEffect(() => {
    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
    getFeed();
  }, [id, getFeed, setSidebarActive]);

  const onNodeClick = (node: PluginInstance) => {
    getSelectedPlugin(node);
  };

  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  const nodePanel = (
    <GridItem
      sm={12}
      smRowSpan={12}
      md={12}
      mdRowSpan={12}
      lg={12}
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
      <PageSection className="section-three">
        <FeedOutputBrowser handlePluginSelect={onNodeClick} />
      </PageSection>
    </React.Suspense>
  );

  const feedTree = (
    <GridItem
      className="feed-block"
      sm={12}
      smRowSpan={12}
      md={12}
      mdRowSpan={12}
      lg={12}
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
            isPanelExpanded={isExpanded}
            onExpand={onClick}
            onNodeClick={onNodeClick}
          />
        ) : (
          <FeedGraph onNodeClick={onNodeClick} />
        )}
      </React.Suspense>
    </GridItem>
  );

  return (
    <React.Fragment>
      <PageSection className="section-one" variant={PageSectionVariants.darker}>
        <FeedDetails />
      </PageSection>

      <Drawer isExpanded={true} isInline position="bottom">
        <DrawerContent
          panelContent={
            <DrawerPanelContent defaultSize="48vh" isResizable>
              {feedOutputBrowserPanel}
            </DrawerPanelContent>
          }
        >
          <PageSection
            className={classNames(
              pf4UtilityStyles.spacingStyles.p_0,
              "section-two"
            )}
            variant={PageSectionVariants.darker}
          >
            <Grid span={12} className="feed-view">
              <Drawer isExpanded={isExpanded} isInline>
                <DrawerContent
                  panelContent={
                    <DrawerPanelContent
                      isResizable
                      defaultSize="50%"
                      minSize={"15%"}
                    >
                      {nodePanel}
                    </DrawerPanelContent>
                  }
                >
                  <DrawerContentBody>{feedTree}</DrawerContentBody>
                </DrawerContent>
              </Drawer>
            </Grid>
          </PageSection>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getFeedRequest: (id: string) => dispatch(getFeedRequest(id)),
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  destroyPluginState: (data: DestroyData) => dispatch(destroyPluginState(data)),
  getSelectedPlugin: (item: PluginInstance) =>
    dispatch(getSelectedPlugin(item)),
});

const mapStateToProps = ({ feed }: ApplicationState) => ({
  pluginInstances: feed.pluginInstances,
  selectedPlugin: feed.selectedPlugin,
  currentLayout: feed.currentLayout,
});


export default connect(mapStateToProps, mapDispatchToProps)(FeedView);
