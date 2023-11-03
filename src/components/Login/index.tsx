import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import ChrisApiClient from "@fnndsc/chrisapi";
import { useCookies } from "react-cookie";

const brandImg2 =
  "https://github.com/patternfly/patternfly-react/raw/main/packages/react-core/src/components/assets/brandImgColor2.svg";

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
import { setAuthToken } from "../../store/user/actions";

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
  const location = useLocation();

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
        setAuthToken({
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
      const then = new URLSearchParams(location.search).get("then");
      if (then) navigate(then);
      else navigate("/");
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
      Need an account? <a href="https://www.patternfly.org/">Sign up.</a>
    </LoginMainFooterBandItem>
  );

  const forgotCredentials = (
    <LoginMainFooterBandItem>
      <span>Please contact a chris admin username or password</span>
    </LoginMainFooterBandItem>
  );

  const listItem = (
    <React.Fragment>
      <ListItem>
        <LoginFooterItem href="https://www.patternfly.org/">
          Terms of Use{" "}
        </LoginFooterItem>
      </ListItem>
      <ListItem>
        <LoginFooterItem href="https://www.patternfly.org/">
          Help
        </LoginFooterItem>
      </ListItem>
      <ListItem>
        <LoginFooterItem href="https://www.patternfly.org/">
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
      footerListVariants={ListVariant.inline}
      brandImgSrc={brandImg2}
      brandImgAlt="PatternFly logo"
      backgroundImgSrc="/assets/images/pfbg-icon.svg"
      footerListItems={listItem}
      textContent="This is placeholder text only. Use this area to place any information or introductory message about your application that may be relevant to users."
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
