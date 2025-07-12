import { Form, FormGroup, TextInput, Button } from "@patternfly/react-core";
import type React from "react";
import { type FormEvent, useContext, useEffect, useRef, useState } from "react";
import { AddNodeContext } from "./context";
import type { RequiredParamProp } from "./types";
import { Types } from "./types";
import { EyeIcon, EyeSlashIcon } from "@patternfly/react-icons";
import { useAppSelector } from "../../store/hooks";

const RequiredParam: React.FC<RequiredParamProp> = ({ param }) => {
  const { state, dispatch } = useContext(AddNodeContext);
  const { requiredInput } = state;
  const inputElement = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Get the current logged-in username from Redux store
  const { username } = useAppSelector((state) => state.user);

  const value = requiredInput?.[param.data.id]?.value ?? "";

  // Check if this is a password field
  const isPasswordField = param.data.flag?.toLowerCase().includes("password");

  // Check if there's a username or user field in the form inputs
  const userField = Object.values(requiredInput || {}).find(
    (input) =>
      input.flag?.toLowerCase().includes("username") ||
      input.flag?.toLowerCase().includes("user"),
  );

  // Determine if the entered username matches the logged-in user
  const usernameMatches = userField?.value === username;

  // Determine if we should show the password toggle button
  const shouldShowPasswordToggle = isPasswordField && usernameMatches;

  const handleInputChange = (value: string) => {
    const { id, flag, help: placeholder, type } = param.data;

    dispatch({
      type: Types.RequiredInput,
      payload: {
        input: {
          [id]: {
            value,
            flag,
            placeholder,
            type,
          },
        },
        editorValue: false,
      },
    });
  };

  useEffect(() => {
    inputElement.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={handleSubmit} className="required-params" isHorizontal>
      <FormGroup style={{ width: "100%" }} isRequired label={param.data.flag}>
        <div style={{ position: "relative", display: "flex" }}>
          <TextInput
            className="required-params__textInput"
            ref={inputElement}
            type={isPasswordField && !showPassword ? "password" : "text"}
            aria-label="required-parameters"
            placeholder={param.data.help}
            value={value}
            id={param.data.name}
            onChange={(_e, value: string) => handleInputChange(value)}
            style={{ flexGrow: 1 }}
          />
          {shouldShowPasswordToggle && (
            <Button
              variant="plain"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: "4px" }}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          )}
        </div>
      </FormGroup>
    </Form>
  );
};

export default RequiredParam;
