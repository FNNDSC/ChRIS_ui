import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import { LoginPage } from "@patternfly/react-core";
import { App, Spin } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import type * as DoUser from "../../reducers/user";
import { useSignUpAllowed } from "../../store/hooks";
import SignUpForm from "./SignUpForm";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  useUser: UseThunk<DoUser.State, TDoUser>;
};
export default (props: Props) => {
  const { useUser } = props;

  const { signUpAllowed, isLoading, isError } = useSignUpAllowed();
  const navigate = useNavigate();

  // Use the message API from Ant Design
  const { message } = App.useApp();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isLoading && !signUpAllowed) {
      // If sign-ups are not allowed, show error and redirect after delay
      message.error(
        "Anonymous sign-ups are not allowed on this platform. Redirecting to login page...",
        3, // Duration in seconds
      );
      timer = setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirect after 3 seconds
    } else if (isError) {
      // If there was an error checking sign-up availability
      message.error(
        "Failed to check sign-up availability. Please try again later. Redirecting to login page...",
        3,
      );
      timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    // Cleanup the timer if the component unmounts
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [signUpAllowed, isLoading, isError, navigate, message]);

  // Determine what content to render inside the LoginPage
  let content: React.ReactNode;
  if (isLoading) {
    // Display a loading spinner while checking sign-up availability
    content = (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" tip="Checking sign-up availability..." />
      </div>
    );
  } else if ((!isLoading && !signUpAllowed) || isError) {
    // Show a message indicating redirecting
    content = (
      <div>
        <p>Redirecting to the login page...</p>
      </div>
    );
  } else {
    // If sign-ups are allowed, render the sign-up form
    content = <SignUpForm useUser={useUser} />;
  }

  return (
    <LoginPage
      className="login pf-background"
      loginTitle="Sign up for a new account"
    >
      {content}
    </LoginPage>
  );
};
