import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setAuthToken } from "../../../store/user/actions";
import { withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { LoginForm } from "@patternfly/react-core";
import ChrisApiClient from "@fnndsc/chrisapi";
import { ExclamationCircleIcon } from "@patternfly/react-icons";

interface IPropsFromDispatch {
  setAuthToken: typeof setAuthToken;
}

interface IState {
  usernameValue: string;
  passwordValue: string;
  isRememberMeChecked: boolean;
  showHelperText: boolean;
  isValidUsername: boolean;
  isValidPassword: boolean;
}

type AllProps = IPropsFromDispatch & RouteComponentProps;

class LoginFormComponent extends React.Component<AllProps, IState> {
  constructor(props: AllProps) {
    super(props);
    this.state = {
      usernameValue: "",
      passwordValue: "",
      isRememberMeChecked: true,
      showHelperText: false,
      isValidUsername: true,
      isValidPassword: true,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Description: Create a fake user to work with API, redux store
  async handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    const { setAuthToken } = this.props;
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    let token;
    try {
      token = await ChrisApiClient.getAuthToken(
        authURL,
        this.state.usernameValue,
        this.state.passwordValue
      );
    } catch (error) {
      this.setState({
        showHelperText: true,
      });
    }

    if (token && this.state.usernameValue) {
      setAuthToken({
        token,
        username: this.state.usernameValue,
      });

      this.props.history.push("/");
    }
  }

  handleUsernameChange = (value: string) => {
    this.setState({ usernameValue: value, showHelperText: false });
  };
  handlePasswordChange = (passwordValue: string) => {
    this.setState({
      passwordValue,
      showHelperText: false,
    });
  };

  onRememberMeClick = () => {
    this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked });
  };

  render() {
    let helperText;
    if (this.state.showHelperText) {
      helperText = (
        <>
          <ExclamationCircleIcon />
          <span> Invalid Login Credentials</span>
        </>
      );
    }

    return (
      <LoginForm
        showHelperText={this.state.showHelperText}
        helperText={helperText}
        usernameLabel="Username"
        usernameValue={this.state.usernameValue}
        onChangeUsername={this.handleUsernameChange}
        isValidUsername={this.state.isValidUsername}
        passwordLabel="Password"
        passwordValue={this.state.passwordValue}
        onChangePassword={this.handlePasswordChange}
        isValidPassword={this.state.isValidPassword}
        isShowPasswordEnabled
        rememberMeLabel="Keep me logged in for 30 days."
        isRememberMeChecked={this.state.isRememberMeChecked}
        onChangeRememberMe={this.onRememberMeClick}
        onLoginButtonClick={this.handleSubmit}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthToken: (auth: { token: string; username: string }) =>
    dispatch(setAuthToken(auth)),
});

export default withRouter(
  connect(null, mapDispatchToProps)(LoginFormComponent)
);
