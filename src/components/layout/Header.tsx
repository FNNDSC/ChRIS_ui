import * as React from 'react';
import {
    PageHeader,
    Brand,
    Avatar
    
} from '@patternfly/react-core';
import brandImg from '../../assets/images/logo_chris-dashboard.png';
import avatarImg from '../../assets/images/avatar-250x250.png';


// const PageToolbar = (
//     <div>toolbar</div>
// )
// const avatar = (
//     <Avatar src={avatarImg} alt="Avatar image" />
// )
// const Header = ({ ...props }) => (
//     <PageHeader 
//         logo={<Brand src={brandImg} alt="ChRIS Logo" />}
//         toolbar={PageToolbar}
//         avatar={avatar}
//         aria-label="Page Header"
//     />
// )
class Header extends React.Component {
    render() {
        const pageToolbar = (
            <div>toolbar</div>
        )
        const avatar = (
            <Avatar src={avatarImg} alt="Avatar image" />
        )
        const brand = (
            < Brand src={brandImg} alt="ChRIS Logo" />
        )
        
        // NOTE: this is a way to get around a "Warning: Invalid attribute name: ``" bug in PageHeader ***** Working: will be revised ***** 
        // The PageHeaderProps defaultProps comes in with and extra empty attribute. See line: 75 PageHeader.js in @patternfly/react-core
        PageHeader.defaultProps = {
            'aria-label': "Page Header",
            'avatar': avatar,
            'logo': brand,
            'toolbar': pageToolbar,
        }
        return (
            <PageHeader />
        )
    }
}

export default Header;
