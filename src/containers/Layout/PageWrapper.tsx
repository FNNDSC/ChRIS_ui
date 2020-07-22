import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onSidebarToggle } from "../../store/ui/actions";
import { Page } from "@patternfly/react-core";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.scss";

interface IOtherProps {
  children: any;
  user: IUserState;
}
interface IPropsFromDispatch {
  onSidebarToggle: typeof onSidebarToggle;
}
type AllProps = IUiState & IOtherProps & IPropsFromDispatch;

class Wrapper extends React.Component<AllProps> {
  // Description: toggles sidebar on pageresize
  onPageResize = (data: { mobileView: boolean; windowSize: number }) => {
    console.log("Page resize called");
    const { isSidebarOpen, onSidebarToggle } = this.props;
    !data.mobileView && !isSidebarOpen && onSidebarToggle(!isSidebarOpen);
  };
  onToggle = () => {
    const { isSidebarOpen, onSidebarToggle } = this.props;
    onSidebarToggle(!isSidebarOpen);
  };
  render() {
    const { children, user } = this.props;

    return (
      <Page
        className="pf-background"
        header={<Header onSidebarToggle={this.onToggle} user={user} />}
        sidebar={<Sidebar />}
        onPageResize={this.onPageResize}
      >
        {children}
      </Page>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened)),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isSidebarOpen: ui.isSidebarOpen,
  loading: ui.loading,
  user,
});

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
