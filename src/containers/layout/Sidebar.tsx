import * as React from 'react';
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import {
    PageSidebar,
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NavGroup
} from '@patternfly/react-core';

// type AllProps = IUiState;

class Sidebar extends React.Component<IUiState> {

    render() {
        const { isSidebarOpen, sidebarActiveItem, sidebarActiveGroup} = this.props;
       
        const PageNav = (
            <Nav  aria-label="ChRIS Demo site navigation">
                <NavList>
                <NavGroup title='Main Navigation'>
                    <NavExpandable title="Library" groupId="library_grp" isActive={sidebarActiveGroup === 'library_grp'}>
                        <NavItem to="libraryitem" groupId="library_grp"  itemId="library_item" isActive={sidebarActiveItem === 'library_item'}>
                                Library Item
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="My Studies" groupId="studies_grp" isActive={sidebarActiveGroup === 'studies_grp'}>
                        <NavItem to="studies" groupId="studies_grp" itemId="my_studies" isActive={sidebarActiveItem === 'my_studies'}>
                            My Studies
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="My Feeds" groupId="feeds_grp" isActive={sidebarActiveGroup === 'feeds_grp'} isExpanded >
                         <NavItem to="/" groupId="feeds_grp" itemId="dashboard" isActive={sidebarActiveItem === 'dashboard'}>
                            My Dashboard
                        </NavItem>
                        <NavItem to="/feeds/myfeedID" groupId="feeds_grp" itemId="my_feeds" isActive={sidebarActiveItem === 'my_feeds'}>
                            My Feeds
                        </NavItem>
                        <NavItem to="/feeds" groupId="feeds_grp" itemId="all_feeds" isActive={sidebarActiveItem === 'all_feeds'}>
                            All Feeds
                        </NavItem> 
                    </NavExpandable>
                    <NavItem to="pipelines" itemId="pipelines" isActive={sidebarActiveItem === 'pipelines'}>
                        Pipelines
                    </NavItem>
                    <NavItem to="plugins" itemId="plugins" isActive={sidebarActiveItem === 'plugins'}>
                        Plugins
                    </NavItem>
                    </NavGroup>
                    <NavGroup title='Working Pages'>
                        <NavItem to="/login" itemId="logIn">
                            Log in
                        </NavItem>
                        <NavItem to="/not-found" itemId="notfound">
                           Not Found
                        </NavItem>
                    </NavGroup>
                 
                </NavList>
            </Nav>
        );
        return (
            <PageSidebar nav={PageNav} isNavOpen={isSidebarOpen} />
        )
    }
}

const mapStateToProps = ({ ui }: ApplicationState) => ({
    isSidebarOpen: ui.isSidebarOpen,
    sidebarActiveItem: ui.sidebarActiveItem,
    sidebarActiveGroup: ui.sidebarActiveGroup
});

export default connect(
    mapStateToProps
)(Sidebar)