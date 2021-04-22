import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onSidebarToggle, setIsNavOpen } from "../../store/ui/actions";
import { Page } from "@patternfly/react-core";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./PageWrapper.scss";

interface IOtherProps {
  children: any;
  user: IUserState;
}
interface IPropsFromDispatch {
  onSidebarToggle: typeof onSidebarToggle;
  setIsNavOpen: typeof setIsNavOpen;
}
type AllProps = IUiState & IOtherProps & IPropsFromDispatch;

const Wrapper: React.FC<AllProps> = (props: AllProps) => {
  const {children, user}: IOtherProps = props
  const onNavToggle = () => {
    props.setIsNavOpen(!props.isNavOpen);
  };

    return (
      <Page
        header={<Header onNavToggle={onNavToggle} user={user} />}
        sidebar={<Sidebar isNavOpen={props.isNavOpen} />}
      >
        {children}
      </Page>
    );
  }

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened)),
  setIsNavOpen: (isOpened: boolean) => dispatch(setIsNavOpen(isOpened)),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isNavOpen: ui.isNavOpen,
  loading: ui.loading,
  user,
});

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
