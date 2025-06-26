import {
  Nav,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
  Brand,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { IUiState } from "../../store/ui/uiSlice";
import type { IUserState } from "../../store/user/userSlice";
import brandImg from "../../assets/logo_chris_dashboard.png";

type AllProps = IUiState & IUserState;

const Sidebar: React.FC<AllProps> = () => {
  const queryClient = useQueryClient();
  const { sidebarActiveItem, isNavOpen } = useAppSelector((state) => state.ui);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

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
    sidebarActiveItem === itemId ? (
      <span style={{ color: "#ffffff" }}>{label}</span>
    ) : (
      <Link to={to}>
        <span style={{ color: "#aaaaaa" }}>{label}</span>
      </Link>
    );

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        <NavItem itemId="overview" isActive={sidebarActiveItem === "overview"}>
          {renderLink("/", "Overview", "overview")}
        </NavItem>
        <NavGroup title="Data">
          <NavItem itemId="data" isActive={sidebarActiveItem === "data"}>
            {renderLink("/feeds", "Browse Data", "data")}
          </NavItem>
          <NavItem
            itemId="uploadData"
            isActive={sidebarActiveItem === "uploadData"}
          >
            {renderLink("/library", "Upload Data", "uploadData")}
          </NavItem>
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            {renderLink(`/feeds?type=${urlParam}`, "New Analysis", "analyses")}
          </NavItem>
          <NavItem itemId="pacs" isActive={sidebarActiveItem === "pacs"}>
            {renderLink("/pacs", "Retrieve PACS", "pacs")}
          </NavItem>
        </NavGroup>
        <NavGroup title="Packages">
          <NavItem itemId="catalog" isActive={sidebarActiveItem === "catalog"}>
            {renderLink("/catalog", "Browse Packages", "catalog")}
          </NavItem>
          <NavItem itemId="compute" isActive={sidebarActiveItem === "compute"}>
            {renderLink("/compute", "Import Package", "compute")}
          </NavItem>
          <NavItem
            itemId="pipelines"
            isActive={sidebarActiveItem === "pipelines"}
          >
            {renderLink("/pipelines", "Compose Package", "pipelines")}
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
      <PageSidebarBody>
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={{ flexGrow: 1 }}>{PageNav}</div>
          <Brand src={brandImg} alt="ChRIS Logo" />
        </div>
      </PageSidebarBody>
    </PageSidebar>
  );
};

export default Sidebar;

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
      <PageSidebarBody>
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={{ flexGrow: 1 }}>{PageNav}</div>
          <div style={{ padding: "16px" }}>
            <Brand src={brandImg} alt="ChRIS Logo" />
          </div>
        </div>
      </PageSidebarBody>
    </PageSidebar>
  );
};

export { AnonSidebarImpl as AnonSidebar };
