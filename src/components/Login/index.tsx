import {
  ListVariant,
  LoginForm,
  LoginMainFooterBandItem,
  LoginPage,
} from "@patternfly/react-core";
import { App } from "antd";
import { type FormEvent, type MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChRIS_Logo from "../../assets/chris-logo.png";
import ChRIS_Logo_Inline from "../../assets/chris-logo-inline.png";
import "./Login.css";
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import * as DoUser from "../../reducers/user";
import { useSignUpAllowed } from "../../store/hooks.ts";
import FooterListItems from "./FooterListItems.tsx";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Status = "idle" | "loading" | "success" | "error";

type Props = {
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const {
    useUser: [classStateUser, doUser],
  } = props;
  const userID = getRootID(classStateUser);
  const user = getState(classStateUser) || DoUser.defaultState;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Use the custom hook
  const { signUpAllowed } = useSignUpAllowed();

  // Use the message API from Ant Design
  const { message } = App.useApp();

  useEffect(() => {
    if (!user.errmsg) {
      setStatus("success");
      return;
    }

    message.error(user.errmsg, 3);
    setStatus("error");
  }, [user.errmsg]);

  const onSubmit = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    doUser.login(userID, username, password);
  };

  const onChangeUsername = (e: FormEvent<HTMLInputElement>, value: string) => {
    setUsername(value);
  };

  const onChangePassword = (e: FormEvent<HTMLInputElement>, value: string) => {
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

  return (
    <LoginPage
      className="login pf-background"
      footerListVariants={ListVariant.inline}
      brandImgSrc={window.innerWidth < 1200 ? ChRIS_Logo_Inline : ChRIS_Logo}
      brandImgAlt="ChRIS logo"
      footerListItems={FooterListItems}
      textContent="ChRIS is a general-purpose, open source, distributed data and computation platform that connects a community of researchers, developers, and clinicians together."
      loginTitle="Log in to your account"
      loginSubtitle="Enter your single sign-on LDAP credentials."
      signUpForAccountMessage={signUpForAccountMessage}
      forgotCredentials={forgotCredentials}
    >
      <LoginForm
        usernameLabel="Username"
        usernameValue={username}
        onChangeUsername={onChangeUsername}
        passwordLabel="Password"
        passwordValue={password}
        onChangePassword={onChangePassword}
        onLoginButtonClick={onSubmit}
        loginButtonLabel="Log in"
        isLoginButtonDisabled={status === "loading"}
      />
    </LoginPage>
  );
};
