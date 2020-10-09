import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
  PageSidebar,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  NavGroup,
  NavItemSeparator,
} from "@patternfly/react-core";
import "./layout.scss";

type AllProps = IUiState & IUserState;

class Sidebar extends React.Component<AllProps> {
  render() {
    const {
      isSidebarOpen,
      sidebarActiveItem,
      sidebarActiveGroup,
      isLoggedIn,
    } = this.props;
    const loggedInFeedNav = isLoggedIn && (
      <React.Fragment>
        <NavItem
          groupId="feeds_grp"
          itemId="my_feeds"
          isActive={sidebarActiveItem === "my_feeds"}
        >
          <Link to="/feeds">Feeds List</Link>
        </NavItem>
      </React.Fragment>
    );

    const PageNav = (
      <Nav theme="light" aria-label="ChRIS Demo site navigation">
        <NavList>
          <NavGroup title="Navigation">
            <NavExpandable
              title="My Dashboard"
              groupId="feeds_grp"
              isActive={sidebarActiveGroup === "feeds_grp"}
              isExpanded
            >
              <NavItem
                groupId="feeds_grp"
                itemId="dashboard"
                isActive={sidebarActiveItem === "dashboard"}
              >
                <Link to={`/`}>Welcome</Link>
              </NavItem>
              <NavItemSeparator />
              {loggedInFeedNav}
            </NavExpandable>
          </NavGroup>
        </NavList>
      </Nav>
    );
    return <PageSidebar nav={PageNav} isNavOpen={isSidebarOpen} />;
  }
}

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isSidebarOpen: ui.isSidebarOpen,
  sidebarActiveItem: ui.sidebarActiveItem,
  sidebarActiveGroup: ui.sidebarActiveGroup,
  isLoggedIn: user.isLoggedIn,
});

export default connect(mapStateToProps)(Sidebar);
