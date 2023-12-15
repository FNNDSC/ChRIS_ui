import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ChrisApiClient from "@fnndsc/chrisapi";
import { useCookies } from "react-cookie";
import ChRIS_Logo from "../../assets/chris-logo.png";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import {
  LoginFooterItem,
  LoginForm,
  LoginMainFooterBandItem,
  LoginPage,
  ListItem,
  ListVariant,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import { setAuthTokenSuccess } from "../../store/user/actions";
import "./Login.css";

export const SimpleLoginPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const [_cookies, setCookie] = useCookies<string>([""]);
  const [showHelperText, setShowHelperText] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [isValidUsername, setIsValidUsername] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [isValidPassword, setIsValidPassword] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

  enum LoginErrorMessage {
    invalidCredentials = `Invalid Credentials`,
    serverError = `There was a problem connecting to the server!`,
  }

  async function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent
  ) {
    event.preventDefault();

    const authURL = import.meta.env.VITE_CHRIS_UI_AUTH_URL;
    let token;

    try {
      token = await ChrisApiClient.getAuthToken(authURL, username, password);
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

    if (token && username) {
      dispatch(
        setAuthTokenSuccess({
          token,
          username: username,
        })
      );
      const oneDayToSeconds = 24 * 60 * 60;
      setCookie(`${username}_token`, token, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
      setCookie("username", username, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
      navigate(-1);
    }
  }

  const handleUsernameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setUsername(value);
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setPassword(value);
  };

  let helperText;
  if (showHelperText) {
    helperText = (
      <HelperText>
        <HelperTextItem variant="error">{errorMessage}</HelperTextItem>
      </HelperText>
    );
  }

  const signUpForAccountMessage = (
    <LoginMainFooterBandItem>
      Need an account? <Link to="/signup">Sign up.</Link>
    </LoginMainFooterBandItem>
  );

  const forgotCredentials = (
    <LoginMainFooterBandItem>
      <span>Contact a ChRIS admin to reset your username or password</span>
    </LoginMainFooterBandItem>
  );

  const listItem = (
    <React.Fragment>
      <ListItem>
        <LoginFooterItem href="https://web.chrisproject.org/">
          Terms of Use{" "}
        </LoginFooterItem>
      </ListItem>
      <ListItem>
        <LoginFooterItem href="https://web.chrisproject.org/">
          Help
        </LoginFooterItem>
      </ListItem>
      <ListItem>
        <LoginFooterItem href="https://web.chrisproject.org/">
          Privacy Policy
        </LoginFooterItem>
      </ListItem>
    </React.Fragment>
  );

  const loginForm = (
    <LoginForm
      showHelperText={showHelperText}
      helperText={helperText}
      helperTextIcon={<ExclamationCircleIcon />}
      usernameLabel="Username"
      usernameValue={username}
      onChangeUsername={handleUsernameChange}
      isValidUsername={isValidUsername}
      passwordLabel="Password"
      passwordValue={password}
      onChangePassword={handlePasswordChange}
      isValidPassword={isValidPassword}
      onLoginButtonClick={handleSubmit}
      loginButtonLabel="Log in"
    />
  );

  return (
    <LoginPage
      className="login pf-background"
      footerListVariants={ListVariant.inline}
      brandImgSrc={window.innerWidth < 1200 ? ChRIS_Logo_Inline : ChRIS_Logo}
      brandImgAlt="ChRIS logo"
      footerListItems={listItem}
      textContent="ChRIS is a general-purpose, open source, distributed data and computation platform that connects a community of researchers, developers, and clinicians together."
      loginTitle="Log in to your account"
      loginSubtitle="Enter your single sign-on LDAP credentials."
      signUpForAccountMessage={signUpForAccountMessage}
      forgotCredentials={forgotCredentials}
    >
      {loginForm}
    </LoginPage>
  );
};

export default SimpleLoginPage;
