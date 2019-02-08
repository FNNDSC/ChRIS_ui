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
} from '@patternfly/react-core';

// type AllProps = IUiState;

class Sidebar extends React.Component<IUiState> {
    // Description: called when item is clicked on the sidebar  ***** working
    onNavSelect = () => {
    };

    render() {
        const { isSidebarOpen } = this.props;
        let activeItem = 'dashboard', 
            activeGroup = 'feeds_grp'; // Will be transferred to state

        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label="ChRIS Demo site navigation">
                <NavList>
                    <NavExpandable title="Library" groupId="library_grp" isActive={activeGroup === 'library_grp'}>
                        <NavItem to="libraryitem" groupId="library_grp"  itemId="library_item" isActive={activeItem === 'library_item'}>
                                Library Item
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="My Studies" groupId="studies_grp" isActive={activeGroup === 'studies_grp'}>
                        <NavItem to="studies" groupId="studies_grp" itemId="my_studies" isActive={activeItem === 'my_studies'}>
                            My Studies
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="My Feeds" groupId="feeds_grp" isActive={activeGroup === 'feeds_grp'} isExpanded >
                         <NavItem to="/" groupId="feeds_grp" itemId="dashboard" isActive={activeItem === 'dashboard'}>
                            My Dashboard
                        </NavItem>
                        <NavItem to="/" groupId="feeds_grp" itemId="my_feeds" isActive={activeItem === 'my_feeds'}>
                            My Feeds
                        </NavItem>
                        <NavItem to="/" groupId="feeds_grp" itemId="all_feeds" isActive={activeItem === 'all_feeds'}>
                            All Feeds
                        </NavItem> 
                    </NavExpandable>
                    <NavItem to="pipelines" itemId="pipelines" isActive={activeItem === 'pipelines'}>
                        Pipelines
                    </NavItem>
                    <NavItem to="plugins" itemId="plugins" isActive={activeItem === 'plugins'}>
                        Plugins
                    </NavItem>
                    <NavItem to="/login" itemId="logIn" isActive={activeItem === 'logIn'}>
                        Log in
                    </NavItem>
                </NavList>
            </Nav>
        );
        return (
            <PageSidebar nav={PageNav} isNavOpen={isSidebarOpen} />
        )
    }
}

const mapStateToProps = ({ ui }: ApplicationState) => ({
    isSidebarOpen: ui.isSidebarOpen
});

export default connect(
    mapStateToProps
)(Sidebar)