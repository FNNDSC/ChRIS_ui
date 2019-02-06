import * as React from 'react';
import {
    PageSidebar,
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NavVariants,
} from '@patternfly/react-core';

class Sidebar extends React.Component {
    onNavSelect = () => {
        // Change active state ***** working
    };

    render() {
        let activeItem = 'dashboard', activeGroup = 'feeds_grp'; // Will be transferred to state

        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label="ChRIS Demo site navigation">
                <NavList >
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
                </NavList>
            </Nav>
        );
        return (
            <PageSidebar nav={PageNav} />
        )
    }
}

export default Sidebar;
