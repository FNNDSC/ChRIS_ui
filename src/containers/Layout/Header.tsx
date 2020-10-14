import * as React from "react";
import { Link } from "react-router-dom";
import ToolbarComponent from "./Toolbar";
import brandImg from "../../assets/images/logo_chris_dashboard.png";
import { IUserState } from "../../store/user/types";
import { PageHeader, PageHeaderTools, Brand } from "@patternfly/react-core";

interface IHeaderProps {
  user: IUserState;
  onNavToggle: () => void;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    const { onNavToggle, user } = this.props;
    const pageToolbar = !!user.token ? (
      <PageHeaderTools>
        <ToolbarComponent />
      </PageHeaderTools>
    ) : (
      <PageHeaderTools>
        <Link to="/login">Log In</Link>
      </PageHeaderTools>
    );

    const brand = <Brand src={brandImg} alt="ChRIS Logo" />;

    return (
      <PageHeader
        className="header"
        aria-label="Page Header"
        logo={brand}
        headerTools={pageToolbar}
        showNavToggle
        onNavToggle={onNavToggle}
      />
    );
  }
}

export default Header;
