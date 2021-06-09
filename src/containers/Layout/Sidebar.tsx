import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
  PageSidebar,
  Nav,
  NavItem,
  NavList,
  NavItemSeparator,
  NavExpandable,
  NavGroup
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import { Dispatch } from "redux";

type ReduxProp = {
  setSidebarActive: (active: {
    activeItem: string;
    activeGroup: string;
  }) => void;
};
type AllProps = IUiState & IUserState & ReduxProp;

const Sidebar: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
  sidebarActiveGroup,
  isLoggedIn,
}: AllProps) => {
  const onSelect = (selectedItem: {
    groupId: number | string;
    itemId: number | string;
    to: string;
    event: React.FormEvent<HTMLInputElement>;
  }) => {
    setSidebarActive({
      activeItem: selectedItem.itemId as string,
      activeGroup: selectedItem.groupId as string,
    });
  };

  const loggedInFeedNav = isLoggedIn && (
    <React.Fragment>
      <NavGroup title="Query">
        <NavItem
          groupId="data_grp"
          itemId="pacs_query"
          isActive={sidebarActiveItem === "pacs_query"}
        >
          <Link to="/pacs">PACS Query</Link>
        </NavItem>
      </NavGroup>
      
      <NavGroup title="Analysis">
        <NavItem
          groupId="feeds_grp"
          itemId="build_feed"
          isActive={sidebarActiveItem === "build_feed"}
        >
          <Link to="/feeds">Build Feed</Link>
        </NavItem>
        <NavItem
          groupId="feeds_grp"
          itemId="my_feeds"
          isActive={sidebarActiveItem === "my_feeds"}
        >
          <Link to="/feeds">Feeds List</Link>
        </NavItem>
      </NavGroup>
      
      <NavItemSeparator />
      
      <NavExpandable
        isExpanded={true}
        title="Workflows"
        groupId="workflows_grp"
        isActive={sidebarActiveGroup === "workflows_grp"}
      >
        <NavItem
          groupId="workflows_grp"
          itemId="my_workflows"
          isActive={sidebarActiveItem === "my_workflows"}
        >
          <Link to="/workflows">Type-1</Link>
        </NavItem>
      </NavExpandable>
    </React.Fragment>
  );

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        {/* <NavItem
          groupId="dashboard_grp"
          itemId="my_dashboard"
          isActive={sidebarActiveItem === "mydashboard"}
        >
          <Link to={`/`}>Welcome</Link>
        </NavItem>
        <NavItemSeparator /> */}
        {loggedInFeedNav}
      </NavList>
    </Nav>
  );

  return <PageSidebar theme="dark" nav={PageNav} isNavOpen={isNavOpen} />;
};

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  sidebarActiveItem: ui.sidebarActiveItem,
  sidebarActiveGroup: ui.sidebarActiveGroup,
  isLoggedIn: user.isLoggedIn,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
