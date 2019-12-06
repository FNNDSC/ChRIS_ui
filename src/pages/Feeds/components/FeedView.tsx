import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps, Link } from "react-router-dom";
import {
  PageSection,
  PageSectionVariants,
  Grid,
  GridItem
} from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import {
  getFeedDetailsRequest,
  destroyFeed
} from "../../../store/feed/actions";
import {
  getPluginDetailsRequest,
  getPluginFilesRequest
} from "../../../store/plugin/actions";
import { IFeedState } from "../../../store/feed/types";
import { IUserState } from "../../../store/user/types";
import { IPluginState } from "../../../store/plugin/types";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import { FeedTree, FeedDetails, NodeDetails } from "../../../components/index";
import { pf4UtilityStyles } from "../../../lib/pf4-styleguides";
import "../feed.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FeedOutputBrowser from "../../../components/feed/FeedOutputBrowser";
import { FeedFile } from "@fnndsc/chrisapi";
import _ from "lodash";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getFeedDetailsRequest: typeof getFeedDetailsRequest;
  getPluginDetailsRequest: typeof getPluginDetailsRequest;
  destroyFeed: typeof destroyFeed;
  getPluginFilesRequest: typeof getPluginFilesRequest;
  files?: FeedFile[];
}

interface Test {
  fileCache?: { [pluginId: number]: FeedFile[] };
}

type AllProps = IUserState &
  IFeedState &
  IPluginState &
  IPropsFromDispatch &
  RouteComponentProps<{ id: string }>;

class FeedView extends React.Component<AllProps, Test> {
  constructor(props: AllProps) {
    super(props);
    const { setSidebarActive, match } = this.props;
    const feedId = match.params.id;
    !!feedId && this.fetchFeedData(feedId);

    document.title = "My Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds"
    });
    this.state = {
      fileCache: []
    };
    this.onNodeClick = this.onNodeClick.bind(this);
  }

  componentDidMount() {
    if (this.props.files && this.props.selected) {
      this.fetchPluginFiles(this.props.files, this.props.selected);
    }
  }
  componentDidUpdate(prevProps: AllProps) {
    const { selected, files } = this.props;
    const { fileCache } = this.state;
    if (!selected) {
      return;
    }
    const id = selected.id as number;
    //const existingFiles = fileCache && fileCache[id];
    if (
      !prevProps.selected ||
      (prevProps.selected.id !== selected.id &&
        !_.isEqual(prevProps.files, files))
    ) {
      !!files && console.log(files);
      !!files && this.fetchPluginFiles(files, selected);
    }
  }

  fetchPluginFiles(files: FeedFile[], selected: IPluginItem) {
    const id = selected.id as number;
    console.log("Files", files);

    this.setState({
      fileCache: {
        ...this.state.fileCache,
        [id]: files
      }
    });
  }

  // Description: this will get the feed details then retrieve the plugin_instances object
  fetchFeedData(feedId: string) {
    const { getFeedDetailsRequest } = this.props;
    getFeedDetailsRequest(feedId);
  }

  render() {
    const { items, details, selected, descendants, token, files } = this.props;

    return (
      <React.Fragment>
        {/* Top section with Feed information */}
        {!!details && !!items && (
          <PageSection variant={PageSectionVariants.darker}>
            <FeedDetails details={details} items={items} />
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
            {!!files ? (
              <FeedOutputBrowser
                token={token || ""}
                selected={selected}
                plugins={items}
                handlePluginSelect={this.onNodeClick}
                files={files}
              />
            ) : (
              <FontAwesomeIcon
                title="This may take a while...."
                icon="spinner"
                pulse
                size="6x"
                color="black"
              />
            )}
          </div>
        </PageSection>
        {/* END OF Bottom section with information */}
      </React.Fragment>
    );
  }

  // Description: handle node clicks to load next node information - descendants, params, and files
  onNodeClick(node: IPluginItem) {
    const { getPluginDetailsRequest, getPluginFilesRequest } = this.props;
    getPluginDetailsRequest(node);
    getPluginFilesRequest(node);
  }

  // Reset feed state so

  componentWillUnmount() {
    this.props.destroyFeed();
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getFeedDetailsRequest: (id: string) => dispatch(getFeedDetailsRequest(id)),
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getPluginDetailsRequest: (item: IPluginItem) =>
    dispatch(getPluginDetailsRequest(item)),
  destroyFeed: () => dispatch(destroyFeed()),
  getPluginFilesRequest: (item: IPluginItem) =>
    dispatch(getPluginFilesRequest(item))
});

const mapStateToProps = ({ ui, feed, user, plugin }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem,
  token: user.token,
  items: feed.items,
  details: feed.details,
  selected: plugin.selected,
  descendants: plugin.descendants,
  files: plugin.files
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedView);
