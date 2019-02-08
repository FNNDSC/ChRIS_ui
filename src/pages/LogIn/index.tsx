import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { 
    LoginFooterItem,
    LoginForm,
    LoginPage,
    BackgroundImageSrc,
    ListItem 
} from '@patternfly/react-core';
import './login.scss';
import brandImg from '../../assets/images/logo_chris_dashboard.png';
type AllProps = RouteComponentProps;

class LogInPage extends React.Component<AllProps> {
    componentDidMount() {
        document.title = "Log in into your ChRIS Account";
    }
  
    render() {
        return (
            <LoginPage
            className="login pf-background"
            footerListVariants="inline"
            brandImgSrc={brandImg}
            brandImgAlt="PatternFly logo"
            
            textContent="This is placeholder text only. Use this area to place any information or introductory message about your
            application that may be relevant to users."
            loginTitle="Log in to your account - WORKING!"
          >
            {/* {loginForm} TBD */}
          </LoginPage>
        );
    }
}

export { LogInPage as LogIn };
