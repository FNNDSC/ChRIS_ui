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
import { setSidebarActive } from "../../store/ui/actions";
import { Dispatch } from "redux";
import "./layout.scss";

type ReduxProp = {
  setSidebarActive: (active: {
    activeItem: string;
    activeGroup: string;
  }) => void;
};
type AllProps = IUiState & IUserState & ReduxProp;

class Sidebar extends React.Component<AllProps> {
  onSelect = (selectedItem: {
    groupId: number | string;
    itemId: number | string;
    to: string;
    event: React.FormEvent<HTMLInputElement>;
  }) => {
    this.props.setSidebarActive({
      activeItem: selectedItem.itemId as string,
      activeGroup: selectedItem.groupId as string,
    });
  };
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
      <Nav onSelect={this.onSelect} aria-label="ChRIS Demo site navigation">
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
