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
import { RouteComponentProps, Link } from "react-router-dom";
import { setSidebarActive } from "../../../store/ui/actions";
import { getFeedRequest, destroyFeed } from "../../../store/feed/actions";
import { getPluginDetailsRequest } from "../../../store/plugin/actions";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import "../feed.scss";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedRequest: typeof getFeedRequest;
  getPluginDetailsRequest: typeof getPluginDetailsRequest;
  destroyFeed: typeof destroyFeed;
}
export type FeedViewProps = IUserState &
  IFeedState &
  IPluginState &
  IPropsFromDispatch &
  RouteComponentProps<{ id: string }>;

export const _FeedView: React.FC<FeedViewProps> = ({
  feed,
  selected,
  pluginInstances,
  setSidebarActive,
  match,
  getFeedRequest,
  destroyFeed,
  getPluginDetailsRequest,
}) => {
  React.useEffect(() => {
    const feedId = match.params.id;
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
    document.title = "My Feeds - ChRIS UI site";
    getFeedRequest(feedId);
    return () => {
      destroyFeed();
    };
  }, []);

  const onNodeClick = (node: PluginInstance) => {
    getPluginDetailsRequest(node);
  };

  return (
    <React.Fragment>
      {!!feed && !!pluginInstances && (
        <PageSection variant={PageSectionVariants.darker}>
          <FeedDetails feed={feed} items={pluginInstances} />
        </PageSection>
      )}
      <PageSection
        className={pf4UtilityStyles.spacingStyles.p_0}
        variant={PageSectionVariants.light}
      >
        <Grid className="feed-view">
          <GridItem className="feed-block pf-u-p-md" sm={12} md={6}>
            <h1>Feed Graph</h1>
            {!!pluginInstances && !!selected ? (
              <FeedTree
                items={pluginInstances}
                selected={selected}
                onNodeClick={onNodeClick}
              />
            ) : (
              <div>
                This Feed does not exist:{" "}
                <Link to="/feeds">Go to All Feeds</Link>
              </div>
            )}
          </GridItem>
          <GridItem className="node-block pf-u-p-md" sm={12} md={6}>
            {!!pluginInstances && !!selected ? (
              <NodeDetails descendants={pluginInstances} selected={selected} />
            ) : (
              <div>Please click on a node to work on a plugin</div>
            )}
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <div className="plugin-info pf-u-py-md">
          {!!pluginInstances && !!selected ? (
            <FeedOutputBrowser
              selected={selected}
              plugins={pluginInstances}
              handlePluginSelect={onNodeClick}
            />
          ) : (
            <div>Fetching Files....</div>
          )}
        </div>
      </PageSection>
    </React.Fragment>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getFeedRequest: (id: string) => dispatch(getFeedRequest(id)),
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getPluginDetailsRequest: (item: PluginInstance) =>
    dispatch(getPluginDetailsRequest(item)),
  destroyFeed: () => dispatch(destroyFeed()),
});

const mapStateToProps = ({ ui, feed, user, plugin }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem,
  feed: feed.feed,
  selected: feed.selected,
  pluginInstances: feed.pluginInstances,
});

const ConnectedFeedView = connect(
  mapStateToProps,
  mapDispatchToProps
)(_FeedView);

export default ConnectedFeedView;
