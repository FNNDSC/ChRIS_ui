import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import {
  LoginPage,
  LoginMainFooterBandItem,
  LoginFooterItem,
  ListItem,
} from "@patternfly/react-core";

import ChRIS_Logo from "../../assets/images/chris-logo.png";
import ChRIS_Logo_inline from "../../assets/images/chris-logo-inline.png";
import LoginFormComponent from "./components/LoginForm";

import "./login.scss";

type AllProps = RouteComponentProps;

const loginTextDesc = `
ChRIS is a general-purpose, open source, distributed data and computation platform that connects a community of researchers, developers, and clinicians together.
`;

const FooterLinks = (
  <React.Fragment>
    <ListItem>
      <LoginFooterItem href="https://www.fnndsc.org/">
        Copyright © {new Date().getFullYear()} Boston Children&apos;s Hospital Fetal-Neonatal
        Neuroimaging and Developmental Science Center
      </LoginFooterItem>
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
      brandImgSrc={window.innerWidth < 1200 ? ChRIS_Logo_inline : ChRIS_Logo}
      brandImgAlt="ChRIS_logo"
      footerListItems={FooterLinks}
    >
      <LoginFormComponent />
    </LoginPage>
  );
};

export { LogInPage as LogIn };
