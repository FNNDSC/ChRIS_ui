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
  feed,
  selected,
  pluginInstances,
  setSidebarActive,
  match: {
    params: { id },
  },
  getFeedRequest,
  destroyFeedState,
  destroyPluginState,
  getSelectedPlugin,
}) => {
  React.useEffect(() => {
    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });

    getFeedRequest(id);
    return () => {
      destroyFeedState();
      destroyPluginState();
    };
  }, [
    id,
    getFeedRequest,
    destroyFeedState,
    destroyPluginState,
    setSidebarActive,
  ]);

  const onNodeClick = (node: PluginInstance) => {
    getSelectedPlugin(node);
  };

  return (
    <React.Fragment>
      {!!feed && !!pluginInstances && pluginInstances.length > 0 && (
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
            {!!pluginInstances && pluginInstances.length > 0 && !!selected ? (
              <FeedTree
                items={pluginInstances}
                selected={selected}
                onNodeClick={onNodeClick}
              />
            ) : (
              <div>
                <h1>This Feed does not exist: </h1>
                <Link to="/feeds">Go to All Feeds</Link>
              </div>
            )}
          </GridItem>
          <GridItem className="node-block pf-u-p-md" sm={12} md={6}>
            {!!pluginInstances && pluginInstances.length > 0 && !!selected ? (
              <NodeDetails descendants={pluginInstances} selected={selected} />
            ) : (
              <div>Please click on a node to work on a plugin</div>
            )}
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <div className="plugin-info pf-u-py-md">
          {!!pluginInstances && pluginInstances.length > 0 && !!selected ? (
            <FeedOutputBrowser
              selected={selected}
              plugins={pluginInstances}
              handlePluginSelect={onNodeClick}
            />
          ) : (
            <Spinner size="lg" />
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
  destroyFeedState: () => dispatch(destroyFeedState()),
  destroyPluginState: () => dispatch(destroyPluginState()),
  getSelectedPlugin: (item: PluginInstance) =>
    dispatch(getSelectedPlugin(item)),
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
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
