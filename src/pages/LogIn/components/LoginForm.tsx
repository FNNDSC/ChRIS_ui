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
import "../login.scss";

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
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    let token;


//validation


   
    if (usernameValue.length === 0) {
          var x = document.getElementById("userNameError")as HTMLElement ;
          x.className = "show";
          setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    if (passwordValue.length < 8) {
      var x = document.getElementById("passwordError")as HTMLElement ;
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      }
    else {
      setIsValidUsername(true);
      setIsValidPassword(true);

      try {
        token = await ChrisApiClient.getAuthToken(
          authURL,
          usernameValue,
          passwordValue
        );
      } catch (error) {
        setErrorMessage(
          (() =>
            //@ts-ignore
            error.response
              ? "Invalid Credentials"
              : "There was a problem connecting to the server!")()
        );
        setShowHelperText(true);
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
  }
  const handleUsernameChange = (value: string) => {
    setUsernameValue(value);
    setShowHelperText(false);
  };
  const handlePasswordChange = (passwordValue: string) => {
    setPasswordValue(passwordValue);
    setShowHelperText(false);
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
    <div>
      
      <div id="userNameError" >username cannot be empty.</div>
      <div id="passwordError" >password cannot be empty.</div>
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
        rememberMeLabel="Keep me logged in for 30 days."
        isRememberMeChecked={isRememberMeChecked}
        onChangeRememberMe={onRememberMeClick}
        onLoginButtonClick={handleSubmit}
      />
      
    </div>
  );
};


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthToken: (auth: { token: string; username: string }) =>
    dispatch(setAuthToken(auth)),
});

export default connect(null, mapDispatchToProps)(LoginFormComponent);
