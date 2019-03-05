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

    // NOTE: this is a way to get around a "Warning: Invalid attribute name: ``" bug in PageHeader ***** Working: will be revised *****
    // Issue #1336 - https://github.com/patternfly/patternfly-react/issues/1336
    // The PageHeaderProps defaultProps comes in with and extra empty attribute. See line: 75 PageHeader.js in @patternfly/react-core
    PageHeader.defaultProps = {
      "className": "header",
      "aria-label": "Page Header",
      "avatar": avatar,
      "logo": brand,
      "toolbar": pageToolbar,
      "showNavToggle": true,
      "onNavToggle": onSidebarToggle
    };
    return <PageHeader />;
  }
}

export default Header;
