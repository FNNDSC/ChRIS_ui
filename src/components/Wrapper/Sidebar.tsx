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
import { useTypedSelector } from "../../store/hooks";

type AllProps = IUiState & IUserState & ReduxProp;
type ReduxProp = {
  setSidebarActive: (active: { activeItem: string }) => void;
};

const Sidebar: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
}: AllProps) => {
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const onSelect = (selectedItem: any) => {
    const { itemId } = selectedItem;
    setSidebarActive({
      activeItem: itemId,
    });
  };

  const urlParam = isLoggedIn ? "private" : "public";

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
            <Link to={`/feeds?type=${urlParam}`}>
              New and Existing Analyses
            </Link>
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

          <NavItem
            itemId="niivue"
            isActive={sidebarActiveItem === "niivue"}
          >
            <Link to="/niivue">Public Datasets</Link>
          </NavItem>

          {import.meta.env.REACT_APP_ALPHA_FEATURES === "development" && (
            <NavItem
              itemId="workflows"
              isActive={sidebarActiveItem === "workflows"}
            >
              <Link to="/workflows">Run a Quick Workflow</Link>
            </NavItem>
          )}

          {import.meta.env.REACT_APP_ALPHA_FEATURES === "development" && (
            <NavItem
              itemId="workflows"
              isActive={sidebarActiveItem === "workflows"}
            >
              <Link to="/workflows">Run a Quick Workflow</Link>
            </NavItem>
          )}
        </NavGroup>
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

const AnonSidebarImpl: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
}: AllProps) => {
  const PageNav = (
    <Nav>
      <NavList>
        <NavGroup title="Sample Data">
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "overview"}
          >
            <Link to="/">Overview</Link>
          </NavItem>

          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            <Link to="/feeds">New and Existing Analyses</Link>
          </NavItem>
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            <Link to="/catalog">Plugins</Link>
          </NavItem>

          <NavItem
            itemId="niivue"
            isActive={sidebarActiveItem === "niivue"}
          >
            <Link to="/niivue">Public Datasets</Link>
          </NavItem>

          <NavItem itemId="login">
            <Link to="/login">Login</Link>
          </NavItem>
        </NavGroup>
      </NavList>
    </Nav>
  );

  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>{PageNav}</PageSidebarBody>
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
