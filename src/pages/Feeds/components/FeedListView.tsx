import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps, Link } from "react-router-dom";
import Moment from "react-moment";
import { PageSection } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { IFeedItem } from "../../../api/models/feed.model";
import { Table, TableVariant } from "@patternfly/react-table";
import { LinkIcon } from "@patternfly/react-icons";
import { DataTableToolbar } from "../../../components/index";
import _ from "lodash";
import debounce from "lodash/debounce";
interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

type AllProps = IFeedState & IPropsFromDispatch & RouteComponentProps;

class AllFeedsPage extends React.Component<AllProps> {
  componentDidMount() {
    const { setSidebarActive, getAllFeedsRequest } = this.props;
    document.title = "All Feeds - ChRIS UI site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "all_feeds"
    });
    getAllFeedsRequest();
  }

  // Description: Debounce the search call
  // recall with search param by name
  onSearch = debounce((term: string) => {
    this.props.getAllFeedsRequest(term);
  }, 500);

  render() {
    const { feeds } = this.props;
    return (
      <PageSection>
        {!!feeds && (
          <div className="white-bg pf-u-p-lg">
            <DataTableToolbar onSearch={this.onSearch} label="name" />
            <Table
              aria-label="Data table"
              variant={TableVariant.compact}
              cells={[]}
              rows={[]}
            >
              <thead>
                <tr>
                  <th>Feed</th>
                  <th>Pipelines</th>
                  <th>Created</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeds.length > 0 &&
                  feeds.map((item: IFeedItem, i) => {
                    return <TableRow key={`items_${i}`} feed={item} />;
                  })}
              </tbody>
            </Table>
          </div>
        )}
      </PageSection>
    );
  }
}

const TableRow = (props: { feed: IFeedItem; key: string }) => {
  const feed = props.feed;
  return (
    <tr>
      <td>
        <Link className="capitalize" to={`/feeds/${feed.id}`}>
          <LinkIcon /> {feed.name}
        </Link>
      </td>
      <td>
        <em>N/A</em>
      </td>
      <td>
        <Moment format="DD MMM YYYY @ HH:mm A">{feed.creation_date}</Moment>
      </td>
      <td> {feed.creator_username}</td>
      <td>
        <em>N/A</em>
      </td>
    </tr>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string) => dispatch(getAllFeedsRequest(name))
});

const mapStateToProps = ({ ui, feed }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem,
  feeds: feed.feeds
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllFeedsPage);
