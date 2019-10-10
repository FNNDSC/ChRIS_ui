import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
    PageSidebar,
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NavGroup, NavItemSeparator
} from "@patternfly/react-core";


type AllProps = IUiState & IUserState;

class Sidebar extends React.Component<AllProps> {

    render() {
        const { isSidebarOpen, sidebarActiveItem, sidebarActiveGroup, isLoggedIn } = this.props;
        const loggedInFeedNav = (
            (isLoggedIn) &&
            (<React.Fragment>
                <NavItem groupId="feeds_grp" itemId="my_feeds" isActive={sidebarActiveItem === "my_feeds"}>
                    <Link to="/feeds">My Feeds</Link>
                </NavItem>
                <NavItem groupId="feeds_grp" itemId="all_feeds" isActive={sidebarActiveItem === "all_feeds"}>
                    <Link to="/feeds">All Feeds</Link>
                </NavItem>
            </React.Fragment>)
        );

        const PageNav = (
            <Nav aria-label="ChRIS Demo site navigation" theme="dark">
                <NavList>
                    <NavGroup title="Main Navigation">
                        <NavExpandable title="Library" groupId="library_grp" isActive={sidebarActiveGroup === "library_grp"}>
                            <NavItem groupId="library_grp" itemId="library_item" isActive={sidebarActiveItem === "library_item"}>
                                <Link to={`/libraryitem`}>Library Item</Link>
                            </NavItem>
                        </NavExpandable>
                        <NavItemSeparator/>
                        <NavExpandable title="My Studies" groupId="studies_grp" isActive={sidebarActiveGroup === "studies_grp"}>
                            <NavItem groupId="studies_grp" itemId="my_studies" isActive={sidebarActiveItem === "my_studies"}>
                                <Link to={`/studies`}> My Studies</Link>
                            </NavItem>
                        </NavExpandable>
                        <NavExpandable title="My Feeds" groupId="feeds_grp" isActive={sidebarActiveGroup === "feeds_grp"} isExpanded >
                            <NavItem groupId="feeds_grp" itemId="dashboard" isActive={sidebarActiveItem === "dashboard"}>
                                <Link to={`/`}>Dashboard</Link>
                            </NavItem>
                            {loggedInFeedNav}
                        </NavExpandable>
                        <NavItemSeparator/>
                        <NavItem to="pipelines" itemId="pipelines" isActive={sidebarActiveItem === "pipelines"}>
                            <Link to="/pipelines">Pipelines</Link>
                        </NavItem>
                        <NavItem itemId="plugins" isActive={sidebarActiveItem === "plugins"}>
                            <Link to="/plugins">Plugins</Link>
                        </NavItem>
                    </NavGroup>
                    {/* This Group will only show in dev environment */}
                    {
                        (process.env.NODE_ENV !== "production") && <NavGroup title="Working Components">
                            <NavExpandable title="Development" groupId="dev_grp" isActive={sidebarActiveGroup === "dev_grp"}>
                                <NavItem to="/charts" itemId="notfound">
                                    <Link to="/ami">Ami Sandbox</Link>
                                </NavItem>
                                <NavItem to="/charts" itemId="notfound">
                                    <Link to="/charts">Charts Sandbox</Link>
                                </NavItem>
                                <NavItem itemId="logIn">
                                    <Link to="/login">Log in</Link>
                                </NavItem>
                                <NavItem to="/not-found" itemId="notfound">
                                    <Link to="/not-found">Not Found</Link>
                                </NavItem>
                            </NavExpandable>
                        </NavGroup>
                }
                </NavList>
            </Nav>
        );
        return (
            <PageSidebar nav={PageNav} isNavOpen={isSidebarOpen} theme="dark" />
        );
    }
}

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
    isSidebarOpen: ui.isSidebarOpen,
    sidebarActiveItem: ui.sidebarActiveItem,
    sidebarActiveGroup: ui.sidebarActiveGroup,
    isLoggedIn: user.isLoggedIn
});

export default connect(
    mapStateToProps
)(Sidebar);
