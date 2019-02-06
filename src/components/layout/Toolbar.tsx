import * as React from 'react';
import {
    Button,
    ButtonVariant,
    Dropdown,
    DropdownItem,
    DropdownSeparator,
    DropdownToggle,
    KebabToggle,
    Toolbar,
    ToolbarGroup,
    ToolbarItem,
} from '@patternfly/react-core';
import {pf4UtilityStyles} from '../../lib/pf4-styleguides';
import { BellIcon, CogIcon } from '@patternfly/react-icons';

class ToolbarComponent extends React.Component {

    onDropdownToggle = (isOpened: boolean) => {
        //  Change active state ***** working
    };

    onDropdownSelect = (event: React.SyntheticEvent<HTMLDivElement>) => {
        //  Change active state ***** working
    };

    onKebabDropdownToggle = (isOpened: boolean) => {
        //  Change active state ***** working
    };

    onKebabDropdownSelect = (event: React.SyntheticEvent<HTMLDivElement>) => {
        //  Change active state ***** working
    };

    render() {
        let isKebabDropdownOpen = false,
            isDropdownOpen = false;   // Will be transferred to state ***** working
        
            const kebabDropdownItems = [
            <DropdownItem>
                <BellIcon /> Notifications
                </DropdownItem>,
            <DropdownItem>
                <CogIcon /> Settings
                </DropdownItem>
        ];

        const userDropdownItems = [
            <DropdownItem>Link</DropdownItem>,
            <DropdownItem component="a">Action</DropdownItem>,
            <DropdownItem isDisabled>Disabled Link</DropdownItem>,
            <DropdownItem isDisabled component="a">
                Disabled Action
                </DropdownItem>,
            <DropdownSeparator />,
            <DropdownItem>Separated Link</DropdownItem>,
            <DropdownItem component="a">Separated Action</DropdownItem>
        ];
        return (
            <Toolbar>
                <ToolbarGroup className={`${pf4UtilityStyles.accessibleStyles.screenReader} ${pf4UtilityStyles.accessibleStyles.visibleOnLg}`}>
                    <ToolbarItem>
                        <Button id="expanded-example-uid-01" aria-label="Notifications actions" variant={ButtonVariant.plain}>
                            <BellIcon />
                        </Button>
                    </ToolbarItem>
                    <ToolbarItem>
                        <Button id="expanded-example-uid-02" aria-label="Settings actions" variant={ButtonVariant.plain}>
                            <CogIcon />
                        </Button>
                    </ToolbarItem>
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarItem className={`${pf4UtilityStyles.accessibleStyles.hiddenOnLg} ${pf4UtilityStyles.spacingStyles.mr_0}`}>
                    
                        <Dropdown
                            isPlain
                            position="right"
                            onSelect={this.onKebabDropdownSelect}
                            toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
                            isOpen={isKebabDropdownOpen}
                            dropdownItems={kebabDropdownItems}
                        />
                    </ToolbarItem>
                    <ToolbarItem className={`${pf4UtilityStyles.accessibleStyles.screenReader} ${pf4UtilityStyles.accessibleStyles.visibleOnMd}`}>
                        <Dropdown
                            isPlain
                            position="right"
                            onSelect={this.onDropdownSelect}
                            isOpen={isDropdownOpen}
                            toggle={<DropdownToggle onToggle={this.onDropdownToggle}>[User Name]</DropdownToggle>}
                            dropdownItems={userDropdownItems}
                        />
                    </ToolbarItem>
                </ToolbarGroup>
            </Toolbar>
        )
    }
}
export default ToolbarComponent;