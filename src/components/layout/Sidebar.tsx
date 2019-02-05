import * as React from 'react';
import {
    PageSidebar,
    Nav,
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
        let activeItem = 0; // Will be transferred to state

        const PageNav = (
            <Nav onSelect={this.onNavSelect} aria-label="Nav">
                <NavList variant={NavVariants.simple}>
                    <NavItem to="library" itemId={0} isActive={activeItem === 0}>
                        Library
                </NavItem>
                    <NavItem to="studies" itemId={1} isActive={activeItem === 1}>
                        My Studies
                </NavItem>
                    <NavItem to="feeds" itemId={2} isActive={activeItem === 2}>
                        Feeds
                </NavItem>
                    <NavItem to="pipelines" itemId={3} isActive={activeItem === 3}>
                        Pipelines
                </NavItem>
                    <NavItem to="plugins" itemId={4} isActive={activeItem === 4}>
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
