import {
  getRootID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  ActionGroup,
  Alert,
  Button,
  Form,
  FormAlert,
  FormGroup,
  HelperText,
  HelperTextItem,
  InputGroup,
  TextInput,
} from "@patternfly/react-core";
import { EyeIcon, EyeSlashIcon } from "@patternfly/react-icons";
import { validate } from "email-validator";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import type * as DoUser from "../../reducers/user";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Validated = {
  error: undefined | "error" | "default" | "success" | "warning";
};

type Props = {
  useUser: UseThunk<DoUser.State, TDoUser>;
  isShowPasswordEnabled?: boolean;
  showPasswordAriaLabel?: string;
  hidePasswordAriaLabel?: string;
};

export default (props: Props) => {
  const {
    useUser: [classStateUser, doUser],
    isShowPasswordEnabled: propsIsShowPasswordEnabled,
    showPasswordAriaLabel: propsShowPasswordAriaLabel,
    hidePasswordAriaLabel: propsHidePasswordAriaLabel,
  } = props;
  const userID = getRootID(classStateUser);

  const isShowPasswordEnabled =
    typeof propsIsShowPasswordEnabled === "undefined"
      ? true
      : propsIsShowPasswordEnabled;

  const showPasswordAriaLabel =
    typeof propsShowPasswordAriaLabel === "undefined"
      ? "Show password"
      : propsShowPasswordAriaLabel;

  const hidePasswordAriaLabel =
    typeof propsHidePasswordAriaLabel === "undefined"
      ? "Hide password"
      : propsHidePasswordAriaLabel;

  const [userState, setUserState] = useState<{
    username: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    username: "",
    validated: "default",
    invalidText: "",
  });
  const [emailState, setEmailState] = useState<{
    email: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    email: "",
    validated: "default",
    invalidText: "",
  });
  const [passwordState, setPasswordState] = useState<{
    password: string;
    validated: Validated["error"];
    invalidText: string;
  }>({
    password: "",
    validated: "default",
    invalidText: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isServerDown, setIsServerDown] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsServerDown(false);
    let isError = false;
    if (!userState.username) {
      setUserState({
        ...userState,
        validated: "error",
        invalidText: "Username is required",
      });
      isError = true;
    }

    if (!emailState.email || !validate(emailState.email)) {
      setEmailState({
        ...emailState,
        validated: "error",
        invalidText: "Email is Required",
      });
      isError = true;
    }

    if (!passwordState.password) {
      setPasswordState({
        ...passwordState,
        validated: "error",
        invalidText: "Password is Required",
      });
      isError = true;
    }

    if (isError) {
      return;
    }

    doUser.createUser(
      userID,
      userState.username,
      passwordState.password,
      emailState.email,
    );
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
    <Form onSubmit={onSubmit} noValidate>
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
