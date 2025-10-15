import {
  Brand,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { Link } from "react-router-dom";
import brandImg from "../../assets/logo_chris_dashboard.png";
import styles from "./Sidebar.module.css";

type Props = {
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
};

export default (props: Props) => {
  const { isNavOpen, sidebarActiveItem } = props;

  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>
        <div className={styles["page-sidebar"]}>
          <div className={styles.nav}>
            {" "}
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
                    itemId="shared"
                    isActive={sidebarActiveItem === "shared"}
                  >
                    <Link to="/shared">Shared Data</Link>
                  </NavItem>

                  <NavItem
                    itemId="package"
                    isActive={sidebarActiveItem === "package"}
                  >
                    <Link to="/package">Browse Packages</Link>
                  </NavItem>
                </NavGroup>
              </NavList>
            </Nav>
          </div>
          <div className={styles.brand}>
            <Brand src={brandImg} alt="ChRIS Logo" />
          </div>
        </div>
      </PageSidebarBody>
    </PageSidebar>
  );
};
