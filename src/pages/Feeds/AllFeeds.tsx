import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { setSidebarActive } from "../../store/ui/actions";
import { RouteComponentProps } from "react-router-dom";
import Wrapper from '../../containers/layout/PageWrapper';
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";


interface PropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
}
type AllProps = PropsFromDispatch & RouteComponentProps;

class AllFeedsPage extends React.Component<AllProps> {
  componentDidMount() {
    const { setSidebarActive } = this.props;
    document.title = "All Feeds - ChRIS UI Demo site";
    setSidebarActive({
      activeItem: 'all_feeds',
      activeGroup: 'feeds_grp'
    })
  }

  render() {
    return (
      <PageSection>
        <h1>All feeds list will go here</h1>
      </PageSection>
    );
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string, activeGroup: string }) => dispatch(setSidebarActive(active)),
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
  sidebarActiveItem: ui.sidebarActiveItem,
  sidebarActiveGroup: ui.sidebarActiveGroup
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllFeedsPage)
