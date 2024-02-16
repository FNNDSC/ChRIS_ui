import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormGroup,
  TextInput,
  Button,
  ActionGroup,
  FormAlert,
  Alert,
  InputGroup,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import ChrisApiClient, { User } from "@fnndsc/chrisapi";
import { Link } from "react-router-dom";
import { has } from "lodash";
import { validate } from "email-validator";
import { setAuthTokenSuccess } from "../../store/user/actions";
import { EyeSlashIcon, EyeIcon } from "@patternfly/react-icons";
import { useCookies } from "react-cookie";

type Validated = {
  error: undefined | "error" | "default" | "success" | "warning";
};

interface SignUpFormProps {
  setAuthTokenSuccess: (auth: {
    token: string;
    username: string;
    isStaff: boolean;
  }) => void;
  isShowPasswordEnabled?: boolean;
  showPasswordAriaLabel?: string;
  hidePasswordAriaLabel?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  setAuthTokenSuccess,
  isShowPasswordEnabled = true,
  hidePasswordAriaLabel = "Hide password",
  showPasswordAriaLabel = "Show password",
}: SignUpFormProps) => {
  /* eslint-disable */
  const [_cookies, setCookie] = useCookies<string>([""]);
  const [userState, setUserState] = React.useState<{
    username: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    username: "",
    validated: "default",
    invalidText: "",
  });
  const [emailState, setEmailState] = React.useState<{
    email: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    email: "",
    validated: "default",
    invalidText: "",
  });
  const [passwordState, setPasswordState] = React.useState<{
    password: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    password: "",
    validated: "default",
    invalidText: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isServerDown, setIsServerDown] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsServerDown(false);
    if (!userState.username) {
      setUserState({
        ...userState,
        validated: "error",
        invalidText: "Username is required",
      });
    }

    if (!emailState.email || !validate(emailState.email)) {
      setEmailState({
        ...emailState,
        validated: "error",
        invalidText: "Email is Required",
      });
    }

    if (!passwordState.password) {
      setPasswordState({
        ...passwordState,
        validated: "error",
        invalidText: "Password is Required",
      });
    }

    setLoading(true);
    const userURL = import.meta.env.VITE_CHRIS_UI_USERS_URL;
    const authURL = import.meta.env.VITE_CHRIS_UI_AUTH_URL;
    let user: User;
    let token: string;

    if (userURL) {
      try {
        user = await ChrisApiClient.createUser(
          userURL,
          userState.username,
          passwordState.password,
          emailState.email,
        );

        token = await ChrisApiClient.getAuthToken(
          authURL,
          userState.username,
          passwordState.password,
        );

        if (user && token) {
          const oneDayToSeconds = 24 * 60 * 60;
          setCookie("username", user.data.username, {
            path: "/",
            maxAge: oneDayToSeconds,
          });
          setCookie(`${user.data.username}_token`, token, {
            path: "/",
            maxAge: oneDayToSeconds,
          });
          setAuthTokenSuccess({
            token,
            username: user.data.username,
            isStaff: user.data.is_staff,
          });
          const then = new URLSearchParams(location.search).get("then");
          if (then) navigate(then);
          else navigate("/");
        }
      } catch (error) {
        if (has(error, "response")) {
          if (has(error, "response.data.username")) {
            setLoading(false);
            setUserState({
              ...userState,
              invalidText: "This username is already registered",
              validated: "error",
            });
          }

          if (has(error, "response.data.email")) {
            setLoading(false);
            setEmailState({
              ...emailState,
              invalidText: "This email address already exists",
              validated: "error",
            });
          }

          if (has(error, "response.data.password")) {
            setLoading(false);
            setPasswordState({
              ...passwordState,
              invalidText: "Password should be at least 8 characters",
              validated: "error",
            });
          } else if (!has(error, "response.data")) {
            setIsServerDown(true);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    }
  };

  const passwordInput = (
    <TextInput
      validated={passwordState.validated}
      value={passwordState.password}
      isRequired
      type={showPassword ? "text" : "password"}
      id="chris-password"
      name="password"
      onChange={(_event, value: string) =>
        setPasswordState({
          invalidText: "",
          validated: "default",
          password: value,
        })
      }
    />
  );

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {isServerDown && (
        <FormAlert>
          <Alert
            variant="danger"
            title={"Problem connecting to the server"}
            aria-live="polite"
            isInline
          />
        </FormAlert>
      )}
      <FormGroup label="Username" isRequired fieldId="username">
        <TextInput
          aria-label="signupform"
          validated={userState.validated}
          value={userState.username}
          isRequired
          type="text"
          id="chris-username"
          aria-describedby="username helper"
          name="username"
          onChange={(_event, value: string) =>
            setUserState({
              invalidText: "",
              validated: "default",
              username: value,
            })
          }
        />
        <HelperText>
          <HelperTextItem variant="error">
            {userState.invalidText}
          </HelperTextItem>
        </HelperText>
      </FormGroup>

      <FormGroup
        label="Email"
        isRequired
        fieldId="
            email"
      >
        <TextInput
          validated={emailState.validated}
          value={emailState.email}
          isRequired
          type="email"
          id="chris-email"
          name="email"
          onChange={(_event, value: string) =>
            setEmailState({
              invalidText: "",
              validated: "default",
              email: value,
            })
          }
        />
        <HelperTextItem>
          <HelperTextItem variant="error">
            {emailState.invalidText}
          </HelperTextItem>
        </HelperTextItem>
      </FormGroup>

      <FormGroup label="Password" isRequired fieldId="password">
        {isShowPasswordEnabled && (
          <InputGroup>
            {passwordInput}
            <Button
              variant="control"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? showPasswordAriaLabel : hidePasswordAriaLabel
              }
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          </InputGroup>
        )}
        <HelperTextItem>
          <HelperTextItem variant="error">
            {passwordState.invalidText}
          </HelperTextItem>
        </HelperTextItem>
      </FormGroup>

      <ActionGroup>
        <Button
          variant="primary"
          type="submit"
          isDisabled={
            !emailState.email && !passwordState.password && !emailState.email
          }
        >
          {loading ? "Loading...." : "Create Account"}
        </Button>
        <Button variant="secondary">
          <Link to="/login">Already have an account?</Link>
        </Button>
      </ActionGroup>
    </Form>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAuthTokenSuccess: (auth: {
    token: string;
    username: string;
    isStaff: boolean;
  }) => dispatch(setAuthTokenSuccess(auth)),
});

export default connect(null, mapDispatchToProps)(SignUpForm);
