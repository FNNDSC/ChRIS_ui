import {
  Nav,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { isEmpty } from "lodash";
import type * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import type { Dispatch } from "redux";
import { useTypedSelector } from "../../store/hooks";
import type { ApplicationState } from "../../store/root/applicationState";
import { setSidebarActive } from "../../store/ui/actions";
import type { IUiState } from "../../store/ui/types";
import type { IUserState } from "../../store/user/types";

type ReduxProp = {
  setSidebarActive: (active: { activeItem: string }) => void;
};

type AllProps = IUiState & IUserState & ReduxProp;

const Sidebar: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
  setSidebarActive,
}) => {
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const onSelect = (selectedItem: any) => {
    const { itemId } = selectedItem;
    if (sidebarActiveItem !== itemId) {
      setSidebarActive({ activeItem: itemId });
    }
  };

  const urlParam = isLoggedIn ? "private" : "public";

  const renderLink = (to: string, label: string, itemId: string) =>
    sidebarActiveItem === itemId && sidebarActiveItem !== "analyses" ? (
      <span style={{ color: "gray" }}>{label}</span>
    ) : (
      <Link to={to}>{label}</Link>
    );

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
            {renderLink("/catalog", "Installed Plugins", "catalog")}
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
          {!isEmpty(import.meta.env.VITE_CHRIS_STORE_URL) && (
            <NavItem itemId="store" isActive={sidebarActiveItem === "store"}>
              {renderLink("/store", "Store", "store")}
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

const AnonSidebarImpl: React.FC<AllProps> = ({
  isNavOpen,
  sidebarActiveItem,
}) => {
  const PageNav = (
    <Nav>
      <NavList>
        <NavGroup title="Discover ChRIS">
          <NavItem
            itemId="overview"
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
            <Link to="/catalog">Installed Plugins</Link>
          </NavItem>
          <NavItem itemId="dataset" isActive={sidebarActiveItem === "dataset"}>
            <Link to="/dataset">Volume View</Link>
          </NavItem>
          {!isEmpty(import.meta.env.VITE_CHRIS_STORE_URL) && (
            <NavItem itemId="store" isActive={sidebarActiveItem === "store"}>
              <Link to="/store">Store</Link>
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

const AnonSidebar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnonSidebarImpl);
export { AnonSidebar };

const SidebarConnect = connect(mapStateToProps, mapDispatchToProps)(Sidebar);
export default SidebarConnect;
