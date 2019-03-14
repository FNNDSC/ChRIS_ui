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
import { IItem, IDatum } from "../../../api/models/base.model";
import { Table, TableVariant } from "@patternfly/react-table";
import * as _ from "lodash";
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

  render() {
    const { feeds } = this.props;
    return (
      <PageSection>
        {!!feeds && (
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
                feeds.map((item: IItem, i) => {
                  return <TableRow key={`items_${i}`} feed={item} />;
                })}
            </tbody>
          </Table>
        )}
      </PageSection>
    );
  }
}

const TableRow = (props: { feed: IItem; key: string }) => {
  const data = props.feed.data;
  const id = getValue(data, "id");
  return (
    <tr>
      <td>
        <Link className="capitalize" to={`/feeds/${id}`}> {getValue(data, "name") }</Link>
      </td>
      <td><em>not available</em></td>
      <td>
        <Moment format="DD MMM YYYY @ HH:mm A">
          {getValue(data, "creation_date")}
        </Moment>
      </td>
      <td>{getValue(data, "creator_username")}</td>
      <td><em>not available</em></td>
    </tr>
  );
};

const getValue = (data: IDatum[], key: string): string => {
  const obj: any = _.find(data, (obj: IDatum) => {
    return obj.name === key && obj.value;
  });
  console.log();
  return !!obj && obj.value;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: () => dispatch(getAllFeedsRequest())
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
