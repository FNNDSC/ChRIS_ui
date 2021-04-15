import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { 
  LoginPage, LoginMainFooterBandItem,
  LoginFooterItem,
  ListItem
} from "@patternfly/react-core";

import ChRIS_Logo from '../../assets/images/chris-logo.png'
import LoginFormComponent from "./components/LoginForm";

import "./login.scss";

type AllProps = RouteComponentProps;

const loginTextDesc = `
  ChRIS is an open source platform that connects an open community of researchers 
  and developers to data quickly and reliably from one computing environment to another.
  `

const FooterLinks = (
  <React.Fragment>
    <ListItem>
      <LoginFooterItem href="#">Terms of Use </LoginFooterItem>
    </ListItem>
    <ListItem>
      <LoginFooterItem href="#">Help</LoginFooterItem>
    </ListItem>
    <ListItem>
      <LoginFooterItem href="#">Privacy Policy</LoginFooterItem>
    </ListItem>
  </React.Fragment>
);

const LogInPage: React.FC<AllProps> = () => {
  React.useEffect(() => {
    // Consider switching to react-helmet?
    document.title = "Log in into your ChRIS Account";
  }, []);

  const signUpForAccountMessage = (
    <LoginMainFooterBandItem>
      Need an account ? <Link to="/signup">Sign up</Link>
    </LoginMainFooterBandItem>
  );
  return (
    <LoginPage
      className="login pf-background"
      loginTitle="Log in to your account"
      signUpForAccountMessage={signUpForAccountMessage}
      textContent={loginTextDesc}
      brandImgSrc={ChRIS_Logo}
      brandImgAlt="ChRIS logo"
      footerListItems={FooterLinks}
    >
      <LoginFormComponent />
    </LoginPage>
  );
};

export { LogInPage as LogIn };
