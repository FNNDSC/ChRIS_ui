import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  FeedTree,
  FeedDetails,
  NodeDetails,
  FeedOutputBrowser,
} from "../../../components/index";

import { PluginInstance } from "@fnndsc/chrisapi";
import { ApplicationState } from "../../../store/root/applicationState";
import { IFeedState } from "../../../store/feed/types";
import { IUserState } from "../../../store/user/types";
import { IPluginState } from "../../../store/plugin/types";
import { RouteComponentProps} from "react-router-dom";
import { setSidebarActive } from "../../../store/ui/actions";
import {
  getFeedRequest,
  destroyFeedState,
  getSelectedPlugin,
} from "../../../store/feed/actions";
import { destroyPluginState } from "../../../store/plugin/actions";

import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
  Spinner,
} from "@patternfly/react-core";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import "../feed.scss";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedRequest: typeof getFeedRequest;
  destroyFeedState: typeof destroyFeedState;
  destroyPluginState: typeof destroyPluginState;
  getSelectedPlugin: typeof getSelectedPlugin;
}

export type FeedViewProps = IUserState &
  IFeedState &
  IPluginState &
  IPropsFromDispatch &
  RouteComponentProps<{ id: string }>;

export const _FeedView: React.FC<FeedViewProps> = ({

  pluginInstances,
  setSidebarActive,
  match: {
    params: { id },
  },
  getFeedRequest,
  getSelectedPlugin,
}) => {
  
  const {data: nodes, loading: pluginInstancesLoading, error:pluginInstancesFetchError}=pluginInstances
  
 
  React.useEffect(() => {
    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
    getFeedRequest(id);
  }, [
    id,
    getFeedRequest,
    setSidebarActive,
  ]);

  const onNodeClick = (node: PluginInstance) => {
    getSelectedPlugin(node);
  };

  return (
    <React.Fragment>
      <PageSection 
      isWidthLimited
      style={{
        height:'220px'
      }}
      variant={PageSectionVariants.darker}>
        <FeedDetails />                 
      </PageSection>
     
      <PageSection
        className={pf4UtilityStyles.spacingStyles.p_0}
        variant={PageSectionVariants.dark}
      >
        <Grid className="feed-view">
          <GridItem className="feed-block" span={6} rowSpan={12}>
            <FeedTree/>    
          </GridItem>
          <GridItem className="node-block" span={6} rowSpan={12}>
            
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <Grid>
          <GridItem span={12} rowSpan={12}>
           
          </GridItem>
        </Grid>
      </PageSection>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getFeedRequest: (id: string) => dispatch(getFeedRequest(id)),
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  destroyFeedState: () => dispatch(destroyFeedState()),
  destroyPluginState: () => dispatch(destroyPluginState()),
  getSelectedPlugin: (item: PluginInstance) =>
    dispatch(getSelectedPlugin(item)),
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
  sidebarActiveItem: ui.sidebarActiveItem,
  selectedPlugin: feed.selectedPlugin,
  pluginInstances: feed.pluginInstances,
});

const ConnectedFeedView = connect(
  mapStateToProps,
  mapDispatchToProps
)(_FeedView);

export default ConnectedFeedView;
