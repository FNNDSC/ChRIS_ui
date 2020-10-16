import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import debounce from "lodash/debounce";

import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHeading,
  Popover,
  PopoverPosition,
  Pagination,
} from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { EyeIcon } from "@patternfly/react-icons";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { DataTableToolbar, LoadingSpinner } from "../../../components/index";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import LoadingContent from "../../../components/common/loading/LoadingContent";
import feedIcon from "../../../assets/images/bw-pipeline.svg";
import { Feed } from "@fnndsc/chrisapi";
import { CreateFeedProvider } from "../../../components/feed/CreateFeed/context";
import { isEqual } from "lodash";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

type AllProps = IFeedState & IPropsFromDispatch;

interface FeedsListViewState {
  perPage: number;
  page: number;
  filter: string;
  descriptions: { [feedId: number]: string };
}

class FeedListView extends React.Component<AllProps, FeedsListViewState> {
  _ismounted = false;

  constructor(props: AllProps) {
    super(props);
    this.state = {
      perPage: 10,
      page: 1,
      filter: "",
      descriptions: {},
    };

    this.generateTableRow = this.generateTableRow.bind(this);
    this.handlePageSet = this.handlePageSet.bind(this);
    this.handlePerPageSet = this.handlePerPageSet.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.fetchFeedDescription = this.fetchFeedDescription.bind(this);
    this.handleDescriptionPopoverShow = this.handleDescriptionPopoverShow.bind(
      this
    );
  }

  componentDidMount() {
    this._ismounted  =  true;;
    const { setSidebarActive } = this.props;
    document.title = "All Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
    this.fetchFeeds();
  }

  componentDidUpdate(prevProps: AllProps, prevState: FeedsListViewState) {
    const { page, perPage, filter } = this.state;

    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });

    if (
      prevState.page !== page ||
      prevState.perPage !== perPage ||
      prevState.filter !== filter ||
      !isEqual(prevProps.feeds, this.props.feeds)
    ) {
      this.fetchFeeds();
    }
  }

  componentWillUnmount(){
    this._ismounted=false;
  }

  /* DATA FETCHING */

  // fetch feeds based on current filter & pagination
  async fetchFeeds() {
    const { filter, perPage, page } = this.state;
    this.props.getAllFeedsRequest(filter, perPage, perPage * (page - 1));
  }

  // fetch total amount of feeds, regardless of filter/pagination

  async fetchFeedDescription(feedItem: Feed["data"]) {
    const client = ChrisAPIClient.getClient();
    const feed = await client.getFeed(feedItem.id);
    const note = await feed.getNote();
    
 
   this.setState((state: FeedsListViewState) => ({
         descriptions: {
           ...state.descriptions,
           [feedItem.id as number]: note.data.content,
         },
       }));  
   
  }

  /* EVENT HANDLERS */

  handlePageSet(e: any, page: number) {
    this.setState({ page });
  }

  handlePerPageSet(e: any, perPage: number) {
    this.setState({ perPage });
  }

  // only update filter every half-second, to avoid too many requests
  handleFilterChange = debounce((value: string) => {
    this.setState({ filter: value });
  }, 200);

  handleDescriptionPopoverShow(feed: Feed["data"]) {
    const description = this.state.descriptions[feed.id as number];
   
    if (!description && this._ismounted) {
      this.fetchFeedDescription(feed);
    }
  }

  /* UI GENERATORS */

  generateTableRow(feed: Feed["data"]) {
    const { descriptions } = this.state;

    const feedDescription = descriptions[feed.id];
    const namePopoverBody =
      feedDescription !== undefined ? (
        <span>{feedDescription || <i>No description</i>}</span>
      ) : (
        <LoadingSpinner isLocal size="sm" />
      );

    const name = {
      title: (
        <Popover
          position={PopoverPosition.right}
          bodyContent={namePopoverBody}
          aria-label="Feed Description"
          className="feed-description-popover"
          onShow={() => this.handleDescriptionPopoverShow(feed)}
        >
          <span className="feed-name">
            <img src={feedIcon} alt="" />
            {feed.name}
          </span>
        </Popover>
      ),
    };

    const created = {
      title: <Moment format="DD MMM YYYY">{feed.creation_date}</Moment>,
    };

    const lastCommit = {
      title: (
        <Moment fromNow className="last-commit">
          {feed.modification_date}
        </Moment>
      ),
    };

    const viewDetails = {
      title: (
        <Link to={`/feeds/${feed.id}`}>
          <EyeIcon />
          View feed details
        </Link>
      ),
    };

    return {
      cells: [name, created, lastCommit, viewDetails],
    };
  }

  generatePagination() {
    const { feeds, feedsCount } = this.props;
    const { perPage, page } = this.state;

    if (!feeds || !feedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={feedsCount}
        perPage={perPage}
        page={page}
        onSetPage={this.handlePageSet}
        onPerPageSelect={this.handlePerPageSet}
      />
    );
  }

  generateTableLoading() {
    return (
      <tbody className="feed-list-loading">
        <tr>
          <td colSpan={4}>
            {new Array(3).fill(null).map((_, i) => (
              <LoadingContent height="45px" width="100%" key={i} />
            ))}
          </td>
        </tr>
      </tbody>
    );
  }

  render() {
   
    const { feeds, feedsCount } = this.props;
  
    const cells = ["Feed", "Created", "Last Commit", ""];
    const rows = (feeds || []).map(this.generateTableRow);

    return (
      <React.Fragment>
        <PageSection variant="light" className="feed-header">
          <Breadcrumb>
            <BreadcrumbItem>Feeds</BreadcrumbItem>
            <BreadcrumbHeading>My Feeds</BreadcrumbHeading>
          </Breadcrumb>
          <div className="bottom">
            <Title headingLevel="h1" size="3xl">
              My Feeds
              {feedsCount && feedsCount > 0 ?
               <span className="feed-count"> ({feedsCount})</span>
               :null
              }
            </Title>
            <CreateFeedProvider>
              <CreateFeed />
            </CreateFeedProvider>
          </div>
        </PageSection>

        <PageSection className="feed-list">
          <div className="white-bg pf-u-p-lg">
            <div className="feed-list-controls">
              <DataTableToolbar
                onSearch={this.handleFilterChange}
                label="name"
              />
              {this.generatePagination()}
            </div>

            <Table aria-label="Data table" cells={cells} rows={rows}>
              <TableHeader />
              {feeds && <TableBody />}
            </Table>

            {this.generatePagination()}
          </div>
        </PageSection>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string, limit?: number, offset?: number) =>
    dispatch(getAllFeedsRequest(name, limit, offset)),
});

const mapStateToProps = ({ feed }: ApplicationState) => ({
  feeds: feed.feeds,
  feedsCount: feed.feedsCount,
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView);
