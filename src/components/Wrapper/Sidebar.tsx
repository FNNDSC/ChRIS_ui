import {
  Nav,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
  Brand,
  NavExpandable,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { IUiState } from "../../store/ui/uiSlice";
import type { IUserState } from "../../store/user/userSlice";
import brandImg from "../../assets/logo_chris_dashboard.png";
import styles from "./Sidebar.module.css";
import type { FormEvent } from "react";
import { AddNodeProvider } from "../AddNode/context";
import { CreateFeedProvider } from "../CreateFeed/context";
import CreateFeed from "../CreateFeed/CreateFeed";
import { PipelineProvider } from "../PipelinesCopy/context";
import Operations from "../NewLibrary/components/Operations";
import { OperationContext, OperationsProvider } from "../NewLibrary/context";

type AllProps = IUiState & IUserState;

type TagInfo = {
  title?: string;
};

const Sidebar: React.FC<AllProps> = (props: AllProps) => {
  const queryClient = useQueryClient();
  const { sidebarActiveItem, isNavOpen, isTagExpanded, isPackageTagExpanded } =
    useAppSelector((state) => state.ui);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const { onTagToggle, onPackageTagToggle } = props;

  console.log(`Sidebar: isTagExpanded: ${isTagExpanded}`);

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

  const renderTag = (
    tag: TagInfo,
    idx: number,
    onClick: (e: FormEvent) => void,
    prefix: string,
  ) => {
    if (typeof tag.title === "undefined") {
      return (
        <NavItem itemId="tag-more" onClick={onClick}>
          <span style={{ color: "#aaaaaa" }}>(more)</span>
        </NavItem>
      );
    }

    const tagIdx = `tag${idx}`;

    const tagLink = tag.title === "(none)" ? "" : `/${tag.title}`;

    return (
      <NavItem itemId={tagIdx} isActive={sidebarActiveItem === tagIdx}>
        {renderLink(`/${prefix}${tagLink}`, tag.title, tagIdx)}
      </NavItem>
    );
  };

  const renderTags = () => {
    const tagList: TagInfo[] = [
      { title: "(none)" },
      { title: "uploaded" },
      { title: "public" },
      { title: "pacs" },
    ];
    if (!isTagExpanded) {
      tagList.push({});
    }

    console.info(
      "renderTags: isTagExpanded:",
      isTagExpanded,
      "tagList",
      tagList,
    );

    return (
      <>
        {tagList.map((each, idx) => renderTag(each, idx, onTagToggle, "tag"))}
      </>
    );
  };

  const renderPackageTags = () => {
    const tagList: TagInfo[] = [{ title: "imported" }, { title: "composite" }];
    if (!isPackageTagExpanded) {
      tagList.push({});
    }

    return (
      <>
        {tagList.map((each, idx) =>
          renderTag(each, idx, onPackageTagToggle, "packagetag"),
        )}
      </>
    );
  };

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        <NavItem itemId="overview" isActive={sidebarActiveItem === "overview"}>
          {renderLink("/", "Overview", "overview")}
        </NavItem>
        <NavGroup title="Data">
          <NavItem itemId="data" isActive={sidebarActiveItem === "data"}>
            {renderLink("/data", "My Data", "data")}
          </NavItem>
          <NavItem itemId="shared" isActive={sidebarActiveItem === "shared"}>
            {renderLink("/shared", "Shared Data", "shared")}
          </NavItem>

          <NavExpandable
            title="Tags"
            buttonProps={{ className: styles["tags-expand"] }}
            isExpanded={true}
          >
            {renderTags()}
          </NavExpandable>
          <NavItem
            itemId="analyses"
            isActive={sidebarActiveItem === "analyses"}
          >
            <CreateFeedProvider>
              <PipelineProvider>
                <AddNodeProvider>
                  <CreateFeed />
                </AddNodeProvider>
              </PipelineProvider>
            </CreateFeedProvider>
          </NavItem>
          <NavItem itemId="pacs" isActive={sidebarActiveItem === "pacs"}>
            {renderLink("/pacs", "Retrieve PACS", "pacs")}
          </NavItem>
        </NavGroup>
        <NavGroup title="Packages">
          <NavItem itemId="package" isActive={sidebarActiveItem === "package"}>
            {renderLink("/package", "Browse Packages", "catalog")}
          </NavItem>
          <NavExpandable
            title="Tags"
            buttonProps={{ className: styles["tags-expand"] }}
            isExpanded={true}
          >
            {renderPackageTags()}
          </NavExpandable>
          {!isEmpty(import.meta.env.VITE_CHRIS_STORE_URL) && (
            <NavItem itemId="store" isActive={sidebarActiveItem === "store"}>
              {renderLink("/import", "Import Package", "store")}
            </NavItem>
          )}
          <NavItem itemId="compose" isActive={sidebarActiveItem === "compose"}>
            {renderLink("/compose", "Compose Package", "compose")}
          </NavItem>
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
          <NavItem itemId="shared" isActive={sidebarActiveItem === "shared"}>
            <Link to="/shared">Shared Data</Link>
          </NavItem>

          <NavItem itemId="package" isActive={sidebarActiveItem === "package"}>
            <Link to="/package">Browse Packages</Link>
          </NavItem>
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
