import * as React from 'react';
import {
    PageSidebar,
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NavVariants,
} from '@patternfly/react-core';

// interface AllProps {
//     isDropdownOpen: boolean;
//     isKebabDropdownOpen: boolean;
//     activeItem: string;
// }

class Sidebar extends React.Component {
    onNavSelect = () => {
        // Change active state ***** working
    };

    render() {
        let activeItem = 'dashboard', activeGroup = 'grp-1'; // Will be transferred to state

        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label="Nav">
                <NavList variant={NavVariants.simple}>
                    <NavExpandable title="Library" groupId="library_grp" isActive={activeGroup === 'library_grp'} isExpanded>
                        <NavItem to="libraryitem" itemId="library_item" isActive={activeItem === 'library_item'}>
                                Library Item
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="Library" groupId="studies_grp" isActive={activeGroup === 'studies_grp'} isExpanded>
                        <NavItem to="studies" itemId="my_studies" isActive={activeItem === 'my_studies'}>
                            My Studies
                        </NavItem>
                    </NavExpandable>
                    <NavExpandable title="Feeds" groupId="grp-1" isActive={activeGroup === 'grp-1'} isExpanded>
                        <NavItem to="/" groupId="grp-1" itemId="dashboard" isActive={activeItem === 'dashboard'}>
                            My Dashboard
                        </NavItem>
                        <NavItem to="/" groupId="grp-1" itemId="my_feeds" isActive={activeItem === 'my_feeds'}>
                            My Feeds
                        </NavItem>
                        <NavItem to="/" groupId="grp-1" itemId="all_feeds" isActive={activeItem === 'all_feeds'}>
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
