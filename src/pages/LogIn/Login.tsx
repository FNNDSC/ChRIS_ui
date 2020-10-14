import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { LoginPage,LoginMainFooterBandItem } from "@patternfly/react-core";
import LoginFormComponent from "./components/LoginForm";
import "./login.scss";

import {Link} from 'react-router-dom'
type AllProps = RouteComponentProps;

class LogInPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Log in into your ChRIS Account";
  }

  render() {
    const signUpForAccountMessage=(
      <LoginMainFooterBandItem>
         Need an account ? <Link to='/signup'>Sign up</Link>
      </LoginMainFooterBandItem>
    )

    const forgotCredentials=(
      <LoginMainFooterBandItem>
        <a href="#">Forgot username or password?</a>
      </LoginMainFooterBandItem>
    )
    return (
      <LoginPage
        className="login pf-background"
        loginTitle="Log in to your account"
        signUpForAccountMessage={signUpForAccountMessage}
        forgotCredentials={forgotCredentials}       
      >
        <LoginFormComponent />
      </LoginPage>
    );
  }
}

export { LogInPage as LogIn };
