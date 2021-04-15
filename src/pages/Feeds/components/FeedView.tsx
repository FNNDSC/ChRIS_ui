import * as React from "react";
import { useTypedSelector} from '../../../store/hooks';
import {useDispatch} from 'react-redux';
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
import {destroyPluginState, getFeedRequest, getSelectedPlugin} from '../../../store/feed/actions'
import {setSidebarActive} from '../../../store/ui/actions'
import { PluginInstance } from "@fnndsc/chrisapi";
import { RouteComponentProps } from "react-router-dom";
import { DestroyData } from "../../../store/feed/types";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import { destroyExplorer } from "../../../store/explorer/actions";
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
const NodeDetails=React.lazy(()=>import("../../../components/feed/NodeDetails/NodeDetails"))

export type FeedViewProps = RouteComponentProps<{ id: string }>;


export const FeedView: React.FC<FeedViewProps> = ({match: { params: { id } } }: FeedViewProps) => {
  const [isSidePanelExpanded, setSidePanelExpanded] = React.useState(true);
  const [isBottomPanelExpanded, setBottomPanelExpanded] = React.useState(true);
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout);
  const pluginInstances = useTypedSelector(
    (state) => state.feed.pluginInstances
  );
  const dispatch = useDispatch();
  const dataRef = React.useRef<DestroyData>();
  const { data } = pluginInstances;

  dataRef.current = {
    data,
    selectedPlugin,
  };

  React.useEffect(() => {
    return () => {
      if (dataRef.current) dispatch(destroyPluginState(dataRef.current));
      dispatch(destroyExplorer());
    };
  }, [dispatch]);

  React.useEffect(() => {
    document.title = "My Feeds - ChRIS UI site";
    dispatch(
      setSidebarActive({
        activeGroup: "feeds_grp",
        activeItem: "my_feeds",
      })
    );
    dispatch(getFeedRequest(id));
  }, [id, dispatch]);

  const onNodeClick = (node: PluginInstance) => {
    dispatch(getSelectedPlugin(node));
  };

  const onClick = (panel: string) => {
    if (panel === "side_panel") {
      setSidePanelExpanded(!isSidePanelExpanded);
    } else if (panel === "bottom_panel") {
      setBottomPanelExpanded(!isBottomPanelExpanded);
    }
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
        <FeedOutputBrowser
          expandDrawer={onClick}
          handlePluginSelect={onNodeClick}
        />
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
            isSidePanelExpanded={isSidePanelExpanded}
            isBottomPanelExpanded={isBottomPanelExpanded}
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

      <Drawer isExpanded={isBottomPanelExpanded} isInline position="bottom">
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
              <Drawer isExpanded={isSidePanelExpanded} isInline>
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



export default FeedView;
