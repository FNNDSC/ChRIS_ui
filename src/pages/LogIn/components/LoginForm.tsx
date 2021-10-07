import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setAuthToken } from "../../../store/user/actions";
import { withRouter } from "react-router-dom";
import { RouteComponentProps, useLocation } from "react-router";
import { useHistory } from "react-router-dom";
import { LoginForm } from "@patternfly/react-core";
import ChrisApiClient from "@fnndsc/chrisapi";
import { ExclamationCircleIcon } from "@patternfly/react-icons";

interface IPropsFromDispatch {
  setAuthToken: typeof setAuthToken;
}

type AllProps = IPropsFromDispatch & RouteComponentProps;
const LoginFormComponent : React.FC<AllProps>=({
  setAuthToken,
}: AllProps)=>{
  const [usernameValue,setUsernameValue]=React.useState<string>("");
  const [passwordValue,setPasswordValue]=React.useState<string>("");
  const [isRememberMeChecked,setIsRememberMeChecked]=React.useState<boolean>(true);
  const [showHelperText,setShowHelperText]=React.useState<boolean>(false);
  const [isValidUsername,setIsValidUsername]=React.useState<boolean>(true);
  const [isValidPassword,setIsValidPassword]=React.useState<boolean>(true);
  const [errorMessage,setErrorMessage]=React.useState<string>("");
  const history = useHistory();
  const location = useLocation();

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    let token;

    if(!usernameValue){
      setIsValidUsername(false);
    }
    if(!passwordValue){
      setIsValidPassword(false);
    }
    else{
      setIsValidUsername(true);
      setIsValidPassword(true);

      try {
        token = await ChrisApiClient.getAuthToken(
          authURL,
          usernameValue,
          passwordValue
        );
      } catch (error: any) {
        setErrorMessage(
          (() =>
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

      const then = (new URLSearchParams(location.search)).get("then")
      if (then)
        history.push(then);
      else
        history.push("/");
    }
  }
  }
  const handleUsernameChange  = (value: string) => { 
    setUsernameValue(value);
    setShowHelperText(false);
  };
  const handlePasswordChange = (passwordValue: string) => {
    setPasswordValue(passwordValue);
    setShowHelperText(false);
  };
  const onRememberMeClick = () => {

    setIsRememberMeChecked((prevIsRememberMeChecked)=>!prevIsRememberMeChecked);
  };

  
  let helperText;
    if (showHelperText) {
      helperText = (
        <>
          <ExclamationCircleIcon />
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
      rememberMeLabel="Keep me logged in for 30 days."
      isRememberMeChecked={isRememberMeChecked}
      onChangeRememberMe={onRememberMeClick}
      onLoginButtonClick={handleSubmit}
    />
  );

}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthToken: (auth: { token: string; username: string }) =>
    dispatch(setAuthToken(auth)),
});

export default withRouter(
  connect(null, mapDispatchToProps)(LoginFormComponent)
);
