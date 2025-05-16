import type React from "react";
import { Nav, NavList, NavItem } from "@patternfly/react-core";
import { Flex, FlexItem } from "@patternfly/react-core";
import {
  HomeIcon,
  FolderIcon,
  ShareIcon,
  CubeIcon,
} from "@patternfly/react-icons";
import styles from "./gnome.module.css";
import GnomeSidebarUploadButton from "./GnmoreUpload";
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
  computedPath,
  handleSidebarItemClick,
  origin,
  foldersList,
}) => {
  return (
    <div className={styles.gnomeLibrarySidebar}>
      <GnomeSidebarUploadButton
        foldersList={foldersList}
        computedPath={computedPath}
        origin={origin}
      />
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
              <FlexItem>Home</FlexItem>
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
        </NavList>
      </Nav>
    </div>
  );
};

export default GnomeLibrarySidebar;
