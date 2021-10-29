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
  NavGroup
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import { Dispatch } from "redux";

type AllProps = IUiState & IUserState & ReduxProp;
type ReduxProp = {
  setSidebarActive: (active: { activeItem: string }) => void;
};

const Sidebar: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem
}: AllProps) => {
  console.log("SidebarActiveItem", sidebarActiveItem);
  const onSelect = (selectedItem: any) => {
    const { itemId } = selectedItem;
    setSidebarActive({
      activeItem: itemId
    });
  };

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        <NavItem itemId="overview" isActive={sidebarActiveItem === "overview"}>
          <Link to="/">Overview</Link>
        </NavItem>

        <NavGroup title="Data">
          <NavItem itemId="lib" isActive={sidebarActiveItem === "lib"}>
            <Link to="/library">My Library</Link>
          </NavItem>
          <NavItem itemId="pacs" isActive={sidebarActiveItem === "pacs"}>
            <Link to="/library/pacs">PACS</Link>
          </NavItem>
        </NavGroup>

        <NavGroup title="Analysis">
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            <Link to="/feeds">My Analyses</Link>
          </NavItem>
          <NavItem
            itemId="workflows"
            isActive={sidebarActiveItem === "workflows"}
          >
            <Link to="/workflows">Create New Analysis</Link>
          </NavItem>
        </NavGroup>
        <NavGroup title="Visualize">
          <NavItem
            itemId="visualizations"
            isActive={sidebarActiveItem === "visualizations"}
          >
            <Link to="/visualization">DICOM Viewer</Link>
          </NavItem>
        </NavGroup>

        <NavGroup title="Apps">
          <NavItem
            itemId="covidnet"
            isActive={sidebarActiveItem === "covidnet"}
          >
            <Link to="/covidnet">COVID-Net</Link>
          </NavItem>
        </NavGroup>
      </NavList>
    </Nav>
  );

  return <PageSidebar theme="dark" nav={PageNav} isNavOpen={isNavOpen} />;
};

const mapStateToProps = ({ user, ui }: ApplicationState) => ({
  isLoggedIn: user.isLoggedIn,
  sidebarActiveItem: ui.sidebarActiveItem
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string }) =>
    dispatch(setSidebarActive(active))
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
