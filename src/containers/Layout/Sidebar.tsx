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
  NavGroup,
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import { Dispatch } from "redux";

type AllProps = IUiState & IUserState & ReduxProp;
type ReduxProp = {
  setSidebarActive: (active: { activeItem: string }) => void;
};

const Sidebar: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
}: AllProps) => {
  const onSelect = (selectedItem: any) => {
    const { itemId } = selectedItem;
    setSidebarActive({
      activeItem: itemId,
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
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            <Link to="/catalog">Analysis Catalog</Link>
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
          <NavItem
            itemId="sliceDrop"
            isActive={sidebarActiveItem === "sliceDrop"}
          >
            <Link to="/slicedrop">SliceDrop</Link>
          </NavItem>
          <NavItem itemId="medview" isActive={sidebarActiveItem === "medview"}>
            <Link to="/medview">Medview</Link>
          </NavItem>
          <NavItem
            itemId="fetalmri"
            isActive={sidebarActiveItem === "fetalmri"}
          >
            <Link to="/fetalmri">Fetal MRI</Link>
          </NavItem>
        </NavGroup>
      </NavList>
    </Nav>
  );

  return <PageSidebar theme="dark" nav={PageNav} isNavOpen={isNavOpen} />;
};

const mapStateToProps = ({ user, ui }: ApplicationState) => ({
  isLoggedIn: user.isLoggedIn,
  sidebarActiveItem: ui.sidebarActiveItem,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string }) =>
    dispatch(setSidebarActive(active)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
