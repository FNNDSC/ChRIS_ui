import * as React from "react";
import { Link } from "react-router-dom";
import ToolbarComponent from "./Toolbar";
import brandImg from "../../assets/images/logo_chris_dashboard.png";
import avatarImg from "../../assets/images/avatar_250x250.png";
import { IUserState } from "../../store/user/types";
import {
    PageHeader,
    Brand,
    Avatar } from "@patternfly/react-core";

interface IHeaderProps {
  user: IUserState;
  onSidebarToggle: () => void;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    const { onSidebarToggle, user } = this.props;
    const pageToolbar = !!user.token ? <ToolbarComponent /> : <Link to="/login">Log In</Link>;
    const avatar = !!user.token && <Avatar src={avatarImg} alt="Avatar image" />;
    const brand = <Brand src={brandImg} alt="ChRIS Logo" />;

    return <PageHeader 
      className="header"
      aria-label="Page Header"
      avatar={avatar}
      logo={brand}
      toolbar={pageToolbar}
      showNavToggle
      onNavToggle={onSidebarToggle}
    />;
  }
}

export default Header;
