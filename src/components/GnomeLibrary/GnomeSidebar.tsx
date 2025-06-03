import type React from "react";
import { Nav, NavList, NavItem } from "@patternfly/react-core";
import { Flex, FlexItem } from "@patternfly/react-core";
import {
  HomeIcon,
  FolderIcon,
  ShareIcon,
  CubeIcon,
  TreeviewIcon,
} from "@patternfly/react-icons";
import styles from "./gnome.module.css";
import type { OriginState } from "../NewLibrary/context";
import type { FileBrowserFolderList } from "@fnndsc/chrisapi";

interface GnomeLibrarySidebarProps {
  activeSidebarItem: string;
  computedPath: string;
  handleSidebarItemClick: (item: string) => void;
  origin: OriginState;
  foldersList?: FileBrowserFolderList;
}

const GnomeLibrarySidebar: React.FC<GnomeLibrarySidebarProps> = ({
  activeSidebarItem,
  handleSidebarItemClick,
}) => {
  return (
    <div className={styles.gnomeLibrarySidebar}>
      <Nav>
        <NavList>
          <NavItem
            key="home"
            isActive={activeSidebarItem === "home"}
            onClick={() => handleSidebarItemClick("home")}
          >
            <Flex>
              <FlexItem>
                <HomeIcon />
              </FlexItem>
              <FlexItem>home</FlexItem>
            </Flex>
          </NavItem>
          <NavItem
            key="pipelines"
            isActive={activeSidebarItem === "PIPELINES"}
            onClick={() => handleSidebarItemClick("PIPELINES")}
          >
            <Flex>
              <FlexItem>
                <TreeviewIcon />
              </FlexItem>
              <FlexItem>PIPELINES</FlexItem>
            </Flex>
          </NavItem>
          <NavItem
            key="public"
            isActive={activeSidebarItem === "public"}
            onClick={() => handleSidebarItemClick("PUBLIC")}
          >
            <Flex>
              <FlexItem>
                <FolderIcon />
              </FlexItem>
              <FlexItem>PUBLIC</FlexItem>
            </Flex>
          </NavItem>

          <NavItem
            key="services"
            isActive={activeSidebarItem === "SERVICES"}
            onClick={() => handleSidebarItemClick("SERVICES")}
          >
            <Flex>
              <FlexItem>
                <CubeIcon />
              </FlexItem>
              <FlexItem>SERVICES</FlexItem>
            </Flex>
          </NavItem>

          <NavItem
            key="shared"
            isActive={activeSidebarItem === "SHARED"}
            onClick={() => handleSidebarItemClick("SHARED")}
          >
            <Flex>
              <FlexItem>
                <ShareIcon />
              </FlexItem>
              <FlexItem>SHARED</FlexItem>
            </Flex>
          </NavItem>
        </NavList>
      </Nav>
    </div>
  );
};

export default GnomeLibrarySidebar;
