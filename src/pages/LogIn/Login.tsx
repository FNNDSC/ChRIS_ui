import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { LoginPage } from "@patternfly/react-core";
import LoginFormComponent from "./components/LoginForm";
import "./login.scss";
import brandImg from "../../assets/images/logo_chris_dashboard.png";
type AllProps = RouteComponentProps;

class LogInPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Log in into your ChRIS Account";
  }

  render() {
    return (
      <LoginPage
        className="login pf-background"
        style={{ background: "black" }}
        brandImgSrc={brandImg}
        brandImgAlt="PatternFly logo"
        loginTitle="Log in to your account"
      >
        <LoginFormComponent />
      </LoginPage>
    );
  }
}

export { LogInPage as LogIn };
