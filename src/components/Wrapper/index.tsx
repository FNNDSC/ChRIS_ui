import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onSidebarToggle, setIsNavOpen } from "../../store/ui/actions";
import { Page } from "@patternfly/react-core";
import Header from "./Header";
import Sidebar, { AnonSidebar } from "./Sidebar";
import { useTypedSelector } from "../../store/hooks";
import "./wrapper.css";

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
  const { children, user }: IOtherProps = props;
  const  onNavToggle = () => {
    props.setIsNavOpen(!props.isNavOpen);
  };

  const onPageResize = (
    _event: MouseEvent | TouchEvent | React.KeyboardEvent<Element>,
    data: { mobileView: boolean; windowSize: number },
  ) => {
    if (data.mobileView) {
      props.setIsNavOpen(false);
    }
    if (!data.mobileView) {
      props.setIsNavOpen(true);
    }
  };

  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const sidebar = isLoggedIn ? (
    <Sidebar isNavOpen={props.isNavOpen} />
  ) : (
    <AnonSidebar isNavOpen={props.isNavOpen} />
  );

  return (
    <Page
      onPageResize={onPageResize}
      header={<Header onNavToggle={onNavToggle} user={user} />}
      sidebar={sidebar}
    >
      {" "}
      {children}
    </Page>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened)),
  setIsNavOpen: (isOpened: boolean) => dispatch(setIsNavOpen(isOpened)),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isNavOpen: ui.isNavOpen,
  loading: ui.loading,
  user,
});

const WrapperConnect = connect(mapStateToProps, mapDispatchToProps)(Wrapper);

export default WrapperConnect;
