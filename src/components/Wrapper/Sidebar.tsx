import {
  Nav,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import type * as React from "react";
import { Link } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks";
import type { IUiState } from "../../store/ui/uiSlice";
import type { IUserState } from "../../store/user/userSlice";

type AllProps = IUiState & IUserState;

const Sidebar: React.FC<AllProps> = () => {
  const queryClient = useQueryClient();
  const { sidebarActiveItem, isNavOpen } = useTypedSelector(
    (state) => state.ui,
  );
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const urlParam = isLoggedIn ? "private" : "public";

  const onSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: any,
  ) => {
    const { itemId } = selectedItem;
    // Invalidate feeds if "analyses" is selected
    if (itemId === "analyses") {
      const queryKey = isLoggedIn ? "feeds" : "publicFeeds";
      queryClient.refetchQueries({
        queryKey: [queryKey], // This assumes your query key for feeds is ["feeds"]
      });
    }
  };

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

export { AnonSidebarImpl as AnonSidebar };

export default Sidebar;
