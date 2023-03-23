import * as React from "react";
import { Link } from "react-router-dom";
import ToolbarComponent from "./Toolbar";
import { FeedDetails } from "../../components";
import brandImg from "../../assets/images/logo_chris_dashboard.png";
import { IUserState } from "../../store/user/types";
import {
  PageHeader,
  PageHeaderTools,
  Brand,
  Nav,
  NavList,
} from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
interface IHeaderProps {
  user: IUserState;
  onNavToggle: () => void;
}

const Header: React.FC<IHeaderProps> = ({
  onNavToggle,
  user,
}: IHeaderProps) => {
  const showToolbar = useTypedSelector((state) => state.feed.showToolbar);
  const pageToolbar = !!user.token ? (
    <PageHeaderTools>
      <ToolbarComponent />
    </PageHeaderTools>
  ) : (
    <PageHeaderTools>
      <Link to="/login">Log In</Link>
    </PageHeaderTools>
  );

  const brand = (
    <React.Fragment>
      <Brand src={brandImg} alt="ChRIS Logo" />
    </React.Fragment>
  );

  return (
    <PageHeader
      className="header"
      aria-label="Page Header"
      logo={brand}
      headerTools={pageToolbar}
      showNavToggle
      onNavToggle={onNavToggle}
      topNav={
        showToolbar && (
          <Nav variant="horizontal">
            <NavList>
              <FeedDetails />
            </NavList>
          </Nav>
        )
      }
    />
  );
};

export default Header;
