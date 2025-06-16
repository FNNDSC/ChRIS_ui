import ChrisApiClient from "@fnndsc/chrisapi";
import {
  ListItem,
  ListVariant,
  LoginFooterItem,
  LoginForm,
  LoginMainFooterBandItem,
  LoginPage,
} from "@patternfly/react-core";
import { App } from "antd";
import queryString from "query-string";
import type React from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ChrisAPIClient from "../../api/chrisapiclient";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import ChRIS_Logo from "../../assets/chris-logo.png";
import { useAppDispatch } from "../../store/hooks.ts";
import { setAuthTokenSuccess } from "../../store/user/userSlice";
import "./Login.css";
import { useSignUpAllowed } from "../../store/hooks.ts";

type Status = "idle" | "loading" | "success" | "error";

export const SimpleLoginPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [_cookies, setCookie] = useCookies<string>([""]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Use the custom hook
  const { signUpAllowed } = useSignUpAllowed();

  // Use the message API from Ant Design
  const { message } = App.useApp();

  async function handleSubmit(
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.KeyboardEvent,
  ) {
    event.preventDefault();

    const authURL = import.meta.env.VITE_CHRIS_UI_AUTH_URL;

    setStatus("loading");

    try {
      const token = await ChrisApiClient.getAuthToken(
        authURL,
        username,
        password,
      );
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

        setStatus("success");

        const { redirectTo } = queryString.parse(location.search) as {
          redirectTo: string;
        };
        if (redirectTo?.startsWith("/library")) {
          navigate(`/library/home/${username}`);
        } else if (redirectTo?.startsWith("/feeds")) {
          const feedIdMatch = redirectTo.match(/^\/feeds\/\d+/);
          if (feedIdMatch) {
            navigate("/feeds?type=private");
          } else {
            navigate(redirectTo);
          }
        } else if (redirectTo) {
          const decodedRedirectTo = decodeURIComponent(redirectTo);
          navigate(decodedRedirectTo);
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      setStatus("error");
      message.error(
        error.response
          ? "Invalid Credentials"
          : "There was a problem connecting to the server!",
        3,
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

  // Conditionally render the "Sign up" link based on signUpAllowed state
  const signUpForAccountMessage = signUpAllowed ? (
    <LoginMainFooterBandItem>
      Need an account? <Link to="/signup">Sign up.</Link>
    </LoginMainFooterBandItem>
  ) : null;

  const forgotCredentials = (
    <LoginMainFooterBandItem>
      <span>Contact a ChRIS admin to reset your username or password</span>
    </LoginMainFooterBandItem>
  );

  const listItem = (
    <>
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
    </>
  );

  const loginForm = (
    <LoginForm
      usernameLabel="Username"
      usernameValue={username}
      onChangeUsername={handleUsernameChange}
      passwordLabel="Password"
      passwordValue={password}
      onChangePassword={handlePasswordChange}
      onLoginButtonClick={handleSubmit}
      loginButtonLabel="Log in"
      isLoginButtonDisabled={status === "loading"}
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
