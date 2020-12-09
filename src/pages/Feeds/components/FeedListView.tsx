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
  Pagination,
  EmptyState,
  EmptyStateBody,
} from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { EyeIcon } from "@patternfly/react-icons";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { DataTableToolbar } from "../../../components/index";
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
      !isEqual(prevProps.allFeeds.data, this.props.allFeeds.data)
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
    const name = {
      title: (
        <span className="feed-name">
          <img src={feedIcon} alt="" />
          <Link to={`/feeds/${feed.id}`}>{feed.name}</Link>
        </span>
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
    const { allFeeds } = this.props;
    const { data, totalFeedsCount } = allFeeds;
    const { perPage, page } = this.state;

    if (!data || !totalFeedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={totalFeedsCount}
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
            {new Array(4).fill(null).map((_, i) => (
              <LoadingContent height="45px" width="100%" key={i} />
            ))}
          </td>
        </tr>
      </tbody>
    );
  }

  render() {
    const { allFeeds } = this.props;
    const { data, loading, error, totalFeedsCount } = allFeeds;

    const cells = ["Feed", "Created", "Last Commit", ""];
    const rows = (data || []).map(this.generateTableRow);

    if (error) {
      return (
        <React.Fragment>
          <EmptyState>
            <EmptyStateBody>
              Oops ! Unable to fetch feeds at the moment. Please refresh the
              browser. If the issue persists, Contact the dev team at FNNDSC to
              report your error.
            </EmptyStateBody>
          </EmptyState>
        </React.Fragment>
      );
    }

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
              {totalFeedsCount > 0 ? (
                <span className="feed-count"> ({totalFeedsCount})</span>
              ) : null}
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
              {loading  ===  true ? this.generateTableLoading() : <TableBody />}
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
  allFeeds: feed.allFeeds,
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView);
