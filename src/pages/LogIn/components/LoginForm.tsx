import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setAuthToken } from "../../../store/user/actions";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router";
import { LoginForm } from "@patternfly/react-core";
import ChrisApiClient from "@fnndsc/chrisapi";
import { AiFillExclamationCircle } from "react-icons/ai";
import { useCookies } from "react-cookie";

interface IPropsFromDispatch {
  setAuthToken: typeof setAuthToken;
}

type AllProps = IPropsFromDispatch;

const LoginFormComponent: React.FC<AllProps> = ({ setAuthToken }: AllProps) => {
  /* eslint-disable */
  const [cookies, setCookie] = useCookies<string>([""]);
  const [usernameValue, setUsernameValue] = React.useState<string>("");
  const [passwordValue, setPasswordValue] = React.useState<string>("");
  const [isRememberMeChecked, setIsRememberMeChecked] =
    React.useState<boolean>(true);
  const [showHelperText, setShowHelperText] = React.useState<boolean>(false);
  const [isValidUsername, setIsValidUsername] = React.useState<boolean>(true);
  const [isValidPassword, setIsValidPassword] = React.useState<boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isLoginButtonDisabled, setIsLoginButtonDisabled] =
    React.useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  enum LoginErrorMessage {
    invalidCredentials = `Invalid Credentials`,
    serverError = `There was a problem connecting to the server!`,
  }

  // Disables the Login Button if there is no Username or a Password with less then 8 characters.
  React.useMemo(() => {
    usernameValue && passwordValue.length > 8
      ? setIsLoginButtonDisabled(false)
      : setIsLoginButtonDisabled(true);
  }, [usernameValue, passwordValue]);

  async function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent
  ) {
    event.preventDefault();

    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    let token;

    try {
      token = await ChrisApiClient.getAuthToken(
        authURL,
        usernameValue,
        passwordValue
      );
    } catch (error: unknown) {
      setShowHelperText(true);
      // Allows error message to be displayed in red
      setIsValidUsername(false);
      setIsValidPassword(false);

      setErrorMessage(() =>
        //@ts-ignore
        error.response
          ? LoginErrorMessage.invalidCredentials
          : LoginErrorMessage.serverError
      );
    }

    if (token && usernameValue) {
      setAuthToken({
        token,
        username: usernameValue,
      });
      const oneDayToSeconds = 24 * 60 * 60;
      setCookie(`${usernameValue}_token`, token, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
      setCookie("username", usernameValue, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
      const then = new URLSearchParams(location.search).get("then");
      if (then) navigate(then);
      else navigate("/");
    }
  }
  const handleUsernameChange = (value: string): void => {
    setUsernameValue(value);
  };
  const handlePasswordChange = (passwordValue: string): void => {
    setPasswordValue(passwordValue);
  };

  const onRememberMeClick = () => {
    setIsRememberMeChecked(
      (prevIsRememberMeChecked) => !prevIsRememberMeChecked
    );
  };

  let helperText;
  if (showHelperText) {
    helperText = (
      <>
        <AiFillExclamationCircle />
        <span> {errorMessage}</span>
      </>
    );
  }

  return (
    <LoginForm
      showHelperText={showHelperText}
      helperText={helperText}
      usernameLabel="Username"
      usernameValue={usernameValue}
      onChangeUsername={handleUsernameChange}
      isValidUsername={isValidUsername}
      passwordLabel="Password"
      passwordValue={passwordValue}
      onChangePassword={handlePasswordChange}
      isValidPassword={isValidPassword}
      isShowPasswordEnabled
      rememberMeLabel="Keep me logged in for 30 days."
      isRememberMeChecked={isRememberMeChecked}
      onChangeRememberMe={onRememberMeClick}
      onLoginButtonClick={handleSubmit}
      isLoginButtonDisabled={isLoginButtonDisabled}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthToken: (auth: { token: string; username: string }) =>
    dispatch(setAuthToken(auth)),
});

export default connect(null, mapDispatchToProps)(LoginFormComponent);
