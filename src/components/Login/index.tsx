import ChrisApiClient from "@fnndsc/chrisapi";
import {
  HelperText,
  HelperTextItem,
  ListItem,
  ListVariant,
  LoginFooterItem,
  LoginForm,
  LoginMainFooterBandItem,
  LoginPage,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "../Icons";
import queryString from "query-string";
import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ChrisAPIClient from "../../api/chrisapiclient";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import ChRIS_Logo from "../../assets/chris-logo.png";
import { setAuthTokenSuccess } from "../../store/user/actions";
import "./Login.css";

export const SimpleLoginPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [_cookies, setCookie] = useCookies<string>([""]);
  const [showHelperText, setShowHelperText] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [isValidUsername, setIsValidUsername] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [isValidPassword, setIsValidPassword] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  enum LoginErrorMessage {
    invalidCredentials = "Invalid Credentials",
    serverError = "There was a problem connecting to the server!",
  }

  async function handleSubmit(
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent,
  ) {
    event.preventDefault();

    const authURL = import.meta.env.VITE_CHRIS_UI_AUTH_URL;
    let token: string;

    try {
      token = await ChrisApiClient.getAuthToken(authURL, username, password);
      if (token && username) {
        const oneDayToSeconds = 24 * 60 * 60;
        setCookie(`${username}_token`, token, {
          path: "/",
          maxAge: oneDayToSeconds,
        });
        setCookie("username", username, {
          path: "/",
          maxAge: oneDayToSeconds,
        });

        const client = ChrisAPIClient.getClient();
        const user = await client.getUser();
        setCookie("isStaff", user.data.is_staff, {
          path: "/",
          maxAge: oneDayToSeconds,
        });

        dispatch(
          setAuthTokenSuccess({
            token,
            username: username,
            isStaff: user.data.is_staff,
          }),
        );

        const { redirectTo } = queryString.parse(location.search) as {
          redirectTo: string;
        };

        if (redirectTo) {
          const decodedRedirectTo = decodeURIComponent(redirectTo);
          navigate(decodedRedirectTo);
        } else {
          navigate("/");
        }
      }
    } catch (error: unknown) {
      setShowHelperText(true);
      // Allows error message to be displayed in red
      setIsValidUsername(false);
      setIsValidPassword(false);

      setErrorMessage(() =>
        //@ts-ignore
        error.response
          ? LoginErrorMessage.invalidCredentials
          : LoginErrorMessage.serverError,
      );
    }
  }

  const handleUsernameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setUsername(value);
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setPassword(value);
  };

  let helperText: React.ReactNode = null;
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
