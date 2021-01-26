import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onSidebarToggle, setIsNavOpenMobile, setMobileView,
setIsNavOpen
} from "../../store/ui/actions";
import { Page } from "@patternfly/react-core";
import Header from "./Header";
import Sidebar from "./Sidebar";


interface IOtherProps {
  children: any;
  user: IUserState;
}
interface IPropsFromDispatch {
  onSidebarToggle: typeof onSidebarToggle;
  setMobileView:typeof setMobileView;
  setIsNavOpenMobile:typeof setIsNavOpenMobile;
  setIsNavOpen:typeof setIsNavOpen;
}
type AllProps = IUiState & IOtherProps & IPropsFromDispatch;

class Wrapper extends React.Component<AllProps> {
  // Description: toggles sidebar on pageresize

  onPageResize = (data: { mobileView: boolean; windowSize: number }) => {
    this.props.setMobileView(data.mobileView);
  };

  onNavToggleMobile = () => {
    this.props.setIsNavOpenMobile(!this.props.isNavOpenMobile);
  };

  onNavToggle = () => {
    this.props.setIsNavOpen(!this.props.isNavOpen);
  };

  render() {
    const { children, user, isMobileView } = this.props;
    

    return (
      <Page
        header={
          <Header
            onNavToggle={
              isMobileView ? this.onNavToggleMobile : this.onNavToggle
            }
            user={user}
          />
        }
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
  setMobileView:(isOpened:boolean)=>dispatch(setMobileView(isOpened)),
  setIsNavOpenMobile:(isOpened:boolean)=>dispatch(setIsNavOpenMobile(isOpened)),
  setIsNavOpen:(isOpened:boolean)=>dispatch(setIsNavOpen(isOpened))

});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isNavOpen:ui.isNavOpen,
  loading: ui.loading,
  user,
  isMobileView:ui.isMobileView,
  isNavOpenMobile:ui.isNavOpenMobile
});

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
