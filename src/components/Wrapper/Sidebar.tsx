import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  PageSidebar,
  Nav,
  NavItem,
  NavList,
  NavGroup,
  PageSidebarBody,
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";

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
            <Link to="/library">Library</Link>
          </NavItem>
          <NavItem itemId="pacs" isActive={sidebarActiveItem === "pacs"}>
            <Link to="/pacs">PACS Query/Retrieve</Link>
          </NavItem>
        </NavGroup>

        <NavGroup title="Analysis">
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            <Link to="/feeds">New and Existing Analyses</Link>
          </NavItem>
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            <Link to="/catalog">Plugins</Link>
          </NavItem>

          <NavItem itemId="compute" isActive={sidebarActiveItem === "compute"}>
            <Link to="/compute">Compute</Link>
          </NavItem>

          <NavItem
            itemId="pipelines"
            isActive={sidebarActiveItem === "pipelines"}
          >
            <Link to="/pipelines">Pipelines</Link>
          </NavItem>

          {import.meta.env.REACT_APP_ALPHA_FEATURES === "development" && (
            <NavItem
              itemId="workflows"
              isActive={sidebarActiveItem === "workflows"}
            >
              <Link to="/workflows">Run a Quick Workflow</Link>
            </NavItem>
          )}
        </NavGroup>

        {import.meta.env.REACT_APP_ALPHA_FEATURES === "development" && (
          <NavGroup title="Collab">
            <NavItem itemId="collab" isActive={sidebarActiveItem === "collab"}>
              <Link to="/collab">Partner</Link>
            </NavItem>
          </NavGroup>
        )}
      </NavList>
    </Nav>
  );

  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>{PageNav}</PageSidebarBody>
    </PageSidebar>
  );
};

const mapStateToProps = ({ user, ui }: ApplicationState) => ({
  isLoggedIn: user.isLoggedIn,
  sidebarActiveItem: ui.sidebarActiveItem,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string }) =>
    dispatch(setSidebarActive(active)),
});

const AnonSidebarImpl: React.FC<AllProps> = ({ isNavOpen }: AllProps) => {
  const body = <div>Please log in to use all features.</div>;
  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>{body}</PageSidebarBody>
    </PageSidebar>
  );
};

const AnonSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(AnonSidebarImpl);
export { AnonSidebar };

const SidebarConnect = connect(mapStateToProps, mapDispatchToProps)(Sidebar);

export default SidebarConnect;
