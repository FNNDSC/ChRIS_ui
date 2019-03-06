import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps } from "react-router-dom";
import {
  Tabs,
  Tab,
  Modal,
  Button,
  PageSection,
  PageSectionVariants
} from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import OutputViewerContainer from "../../../components/viewer/viewerContainer";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
}
type AllProps = IPropsFromDispatch & RouteComponentProps;
type IState = { isModalOpen: boolean };
class OutputViewer extends React.Component<AllProps, IState> {
  constructor(props: AllProps) {
    super(props);
    this.handleModalToggle = this.handleModalToggle.bind(this);
  }
  componentDidMount() {
    const { setSidebarActive } = this.props;
    document.title = "All Feeds - ChRIS UI Demo site";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "all_feeds"
    });
  }

  state = {
    isModalOpen: false
  };

  handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen
    }));
  };
  render() {
    const { isModalOpen } = this.state;
    return (
      <PageSection variant={PageSectionVariants.light}>
        <React.Fragment>
          <Button variant="primary" onClick={this.handleModalToggle}>
            Show Modal
          </Button>
          <OutputViewerContainer />
          <Modal
            title="Modal Header"
            isOpen={isModalOpen}
            onClose={this.handleModalToggle}
            actions={[
              <Button
                key="cancel"
                variant="secondary"
                onClick={this.handleModalToggle}
              >
                Cancel
              </Button>,
              <Button
                key="confirm"
                variant="primary"
                onClick={this.handleModalToggle}
              >
                Confirm
              </Button>
            ]}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Modal>
        </React.Fragment>
      </PageSection>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active))
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
  sidebarActiveGroup: ui.sidebarActiveGroup,
  sidebarActiveItem: ui.sidebarActiveItem
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutputViewer);
