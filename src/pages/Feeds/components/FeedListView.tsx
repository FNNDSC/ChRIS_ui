import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {RouteComponentProps, Link } from "react-router-dom";
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";


interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
}
type AllProps = IPropsFromDispatch & RouteComponentProps;

class AllFeedsPage extends React.Component<AllProps> {
  componentDidMount() {
    const { setSidebarActive } = this.props;
    document.title = "All Feeds - ChRIS UI Demo site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "all_feeds"
    });
  }

  render() {
    return (
      <PageSection>
        <Alert
          aria-label="Feeds warning"
          variant="warning"
          title="Working feed component"  >
          All feeds or My feeds list will be displayed here <br />
          Pass a filter param for my feeds vs all feed - working !  <Link to="/feeds/2">Go to Feed view</Link>
        </Alert>
      </PageSection>
    );
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string, activeGroup: string }) => dispatch(setSidebarActive(active)),
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllFeedsPage);
