import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import {
  FeedTree,
  FeedDetails,
  NodeDetails,
  FeedOutputBrowser,
} from "../../../components";
import { setSidebarActive } from "../../../store/ui/actions";
import {
  getFeedRequest,
  destroyFeedState,
  getSelectedPlugin,
 
} from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import { RouteComponentProps } from "react-router-dom";
import { ApplicationState } from "../../../store/root/applicationState";
import { IFeedState } from "../../../store/feed/types";
import { IUserState } from "../../../store/user/types";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import "../feed.scss";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedRequest: typeof getFeedRequest;
  destroyFeedState: typeof destroyFeedState;
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
  destroyFeedState
}) => {
  React.useEffect(() => {
    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
    getFeedRequest(id);

    return ()=>{
       destroyFeedState()
    }
  }, [id, getFeedRequest, setSidebarActive,destroyFeedState]);

  const onNodeClick = (node: PluginInstance) => {
    getSelectedPlugin(node);
  };

  return (
    <React.Fragment>
      <PageSection
        isWidthLimited
        style={{
          height: "220px",
        }}
        variant={PageSectionVariants.darker}
      >
        <FeedDetails />
      </PageSection>

      <PageSection
        className={pf4UtilityStyles.spacingStyles.p_0}
        variant={PageSectionVariants.dark}
      >
        <Grid className="feed-view">
          <GridItem className="feed-block" span={6} rowSpan={12}>
            <FeedTree onNodeClick={onNodeClick} />
          </GridItem>
          <GridItem className="node-block" span={6} rowSpan={12}>
            <NodeDetails />
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <Grid>
          <GridItem span={12} rowSpan={12}>
            <FeedOutputBrowser handlePluginSelect={onNodeClick} />
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
  getSelectedPlugin: (item: PluginInstance) =>
    dispatch(getSelectedPlugin(item)),
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
  sidebarActiveItem: ui.sidebarActiveItem,
  selectedPlugin: feed.selectedPlugin,
  pluginInstances: feed.pluginInstances,
});


export default connect(mapStateToProps, mapDispatchToProps)(FeedView);
