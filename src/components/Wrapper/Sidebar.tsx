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
    if (sidebarActiveItem === itemId) return;
    setSidebarActive({
      activeItem: itemId,
    });
  };

  const urlParam = isLoggedIn ? "private" : "public";

  const renderLink = (to: string, label: string, itemId: string) => {
    // Don't do this for existing analyses
    if (sidebarActiveItem !== "analyses" && sidebarActiveItem === itemId) {
      return <span style={{ color: "gray" }}>{label}</span>;
    }
    return <Link to={to}>{label}</Link>;
  };

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        <NavItem itemId="overview" isActive={sidebarActiveItem === "overview"}>
          {renderLink("/", "Overview", "overview")}
        </NavItem>

        <NavGroup title="Data">
          <NavItem itemId="lib" isActive={sidebarActiveItem === "lib"}>
            {renderLink("/library", "Library", "lib")}
          </NavItem>
          <NavItem itemId="pacs" isActive={sidebarActiveItem === "pacs"}>
            {renderLink("/pacs", "PACS Query/Retrieve", "pacs")}
          </NavItem>
        </NavGroup>

        <NavGroup title="Analysis">
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            {renderLink(
              `/feeds?type=${urlParam}`,
              "New and Existing Analyses",
              "analyses",
            )}
          </NavItem>
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            {renderLink("/catalog", "Plugins", "catalog")}
          </NavItem>

          <NavItem itemId="compute" isActive={sidebarActiveItem === "compute"}>
            {renderLink("/compute", "Compute", "compute")}
          </NavItem>

          <NavItem
            itemId="pipelines"
            isActive={sidebarActiveItem === "pipelines"}
          >
            {renderLink("/pipelines", "Pipelines", "pipelines")}
          </NavItem>

          <NavItem itemId="dataset" isActive={sidebarActiveItem === "dataset"}>
            {renderLink("/dataset", "Volume View", "dataset")}
          </NavItem>

          <NavItem itemId="store" isActive={sidebarActiveItem === "store"}>
            {renderLink("/store", "Store", "store")}
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
        <NavGroup title="Discover ChRIS">
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
            <Link to="/feeds?type=public">New and Existing Analyses</Link>
          </NavItem>
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            <Link to="/catalog">Plugins</Link>
          </NavItem>
          <NavItem itemId="dataset" isActive={sidebarActiveItem === "dataset"}>
            <Link to="/dataset">Volume View</Link>
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
  mapDispatchToProps,
)(AnonSidebarImpl);
export { AnonSidebar };

const SidebarConnect = connect(mapStateToProps, mapDispatchToProps)(Sidebar);

export default SidebarConnect;
