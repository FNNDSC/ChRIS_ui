import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
  PageSidebar,
  Nav,
  NavItem,
  NavList,
  NavExpandable,
  NavGroup
} from "@patternfly/react-core";
import { setSidebarActive } from "../../store/ui/actions";
import { Dispatch } from "redux";

type AllProps = IUiState & IUserState & ReduxProp;
type ReduxProp = {
  setSidebarActive: (active: {
    activeItem: string;
    activeGroup: string;
  }) => void;
};

const Sidebar: React.FC<AllProps> = ({ isNavOpen }: AllProps) => {
  const [active, setActive] = React.useState<string>()
  const onSelect = (selectedItem: any) => {
    setActive(String(selectedItem.itemId));
  };

  const PageNav = (
    <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
      <NavList>
        <NavGroup title="Data Library">
          <NavItem itemId="lib" isActive={active === "lib"}>
            <Link to="/library">My Library</Link>
          </NavItem>

          <NavItem itemId="swift" isActive={active === "swift"}>
            <Link to="/library/swift">Swift Lookup</Link>
          </NavItem>

          <NavItem itemId="pacs" isActive={active === "pacs"}>          
            <Link to="/library/pacs">PACS Lookup</Link>
          </NavItem>
        </NavGroup>

        <NavGroup title="Analyse">
          <NavItem itemId="build_feed" isActive={active === "build_feed"}>
            <Link to="/feeds">Build Feed</Link>
          </NavItem>

          <NavItem itemId="feeds" isActive={active === "feeds"}>
            <Link to="/feeds">Feeds List</Link>
          </NavItem>
        
          <NavExpandable title="Workflows" isExpanded={true}>
            <NavItem itemId="wf_COVIDnet" isActive={active === "wf_COVIDnet"}>
              <Link to="/workflows">COVIDnet</Link>
            </NavItem>
          </NavExpandable>
        </NavGroup>
      </NavList>
    </Nav>
  );

  return <PageSidebar theme="dark" nav={PageNav} isNavOpen={isNavOpen} />;
};

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isLoggedIn: user.isLoggedIn,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
