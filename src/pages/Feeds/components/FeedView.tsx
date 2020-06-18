import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps, Link } from "react-router-dom";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getFeedRequest, destroyFeed } from "../../../store/feed/actions";
import { getPluginDetailsRequest } from "../../../store/plugin/actions";
import { IFeedState } from "../../../store/feed/types";
import { IUserState } from "../../../store/user/types";
import { IPluginState } from "../../../store/plugin/types";
import { FeedTree, FeedDetails, NodeDetails } from "../../../components/index";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import "../feed.scss";
import FeedOutputBrowser from "../../../components/feed/FeedOutputBrowser";
import { PluginInstance } from "@fnndsc/chrisapi";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedRequest: typeof getFeedRequest;
  getPluginDetailsRequest: typeof getPluginDetailsRequest;
  destroyFeed: typeof destroyFeed;
}

type AllProps = IUserState &
  IFeedState &
  IPluginState &
  IPropsFromDispatch &
  RouteComponentProps<{ id: string }>;

class FeedView extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    const { setSidebarActive, match } = this.props;
    const feedId = match.params.id;
    !!feedId && this.fetchFeedData(feedId);

    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });

    this.onNodeClick = this.onNodeClick.bind(this);
  }

  // Description: this will get the feed details then retrieve the plugin_instances object
  fetchFeedData(feedId: string) {
    const { getFeedRequest } = this.props;
    getFeedRequest(feedId);
  }

  render() {
    const { items, feed, selected, descendants, token } = this.props;

    return (
      <React.Fragment>
        {/* Top section with Feed information */}
        {!!feed && !!items && (
          <PageSection variant={PageSectionVariants.darker}>
            <FeedDetails feed={feed} items={items} />
          </PageSection>
        )}
        {/* END Top section with Feed information */}

        {/* Mid section with Feed and node actions */}
        <PageSection
          className={pf4UtilityStyles.spacingStyles.p_0}
          variant={PageSectionVariants.light}
        >
          <Grid className="feed-view">
            <GridItem className="feed-block pf-u-p-md" sm={12} md={6}>
              <h1>Feed Graph</h1>
              {!!items ? (
                <FeedTree
                  items={items}
                  selected={selected}
                  onNodeClick={this.onNodeClick}
                />
              ) : (
                <div>
                  This Feed does not exist:{" "}
                  <Link to="/feeds">Go to All Feeds</Link>
                </div>
              )}
            </GridItem>
            <GridItem className="node-block pf-u-p-md" sm={12} md={6}>
              {!!descendants && !!selected ? (
                <NodeDetails descendants={descendants} selected={selected} />
              ) : (
                <div>Please click on a node to work on a plugin</div>
              )}
            </GridItem>
          </Grid>
        </PageSection>
        {/* END Mid section with Feed and node actions */}

        {/* Bottom section with information */}
        <PageSection>
          <div className="plugin-info pf-u-py-md">
            {/*
              <FeedOutputBrowser
                token={token || ""}
                selected={selected}
                plugins={items}
                handlePluginSelect={this.onNodeClick}
              />
              */}
          </div>
        </PageSection>
        {/* END OF Bottom section with information */}
      </React.Fragment>
    );
  }

  // Description: handle node clicks to load next node information - descendants, params, and files
  onNodeClick(node: PluginInstance) {
    const { getPluginDetailsRequest } = this.props;
    getPluginDetailsRequest(node);
  }

  // Reset feed state so

  componentWillUnmount() {
    this.props.destroyFeed();
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getFeedDetailsRequest: (id: string) => dispatch(getFeedRequest(id)),
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getPluginDetailsRequest: (item: PluginInstance) =>
    dispatch(getPluginDetailsRequest(item)),
  destroyFeed: () => dispatch(destroyFeed()),
});

const mapStateToProps = ({ ui, feed, user, plugin }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem,
  token: user.token,
  items: feed.items,
  feed: feed.feed,
  selected: plugin.selected,
  descendants: plugin.descendants,
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedView);
