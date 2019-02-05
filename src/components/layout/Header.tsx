import * as React from 'react';
import { 
    PageHeader, 
    Brand, 
    Avatar
 } from '@patternfly/react-core';
import brandImg from '../../assets/images/logo_chris-dashboard.png';
import avatarImg from '../../assets/images/avatar-250x250.png';


class Header extends React.Component {
  
    render() {
        const PageToolbar = (
            <div>toolbar</div>
        )
        const avatar = (
            <Avatar src={avatarImg} alt="Avatar image" />
        )
        return (
            <PageHeader
                logo={<Brand src={brandImg} alt="ChRIS Logo" />}
                toolbar={PageToolbar}
                avatar={avatar}
                aria-label="Page Header"
            />

        )
    }
}

export default Header;
