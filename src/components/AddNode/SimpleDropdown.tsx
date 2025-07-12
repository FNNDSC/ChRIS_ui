import type { PluginParameter } from "@fnndsc/chrisapi";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  TextInput,
} from "@patternfly/react-core";
import React, { useContext, useEffect, useState } from "react";
import { CloseIcon } from "../Icons";
import type { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./utils";
import { v4 } from "uuid";
import { AddNodeContext } from "./context";
import { Types } from "./types";
import { EyeIcon, EyeSlashIcon } from "@patternfly/react-icons";
import { useAppSelector } from "../../store/hooks";

function getInitialState() {
  return {
    isOpen: false,
  };
}

const SimpleDropdown = ({ id, params }: SimpleDropdownProps) => {
  const { state, dispatch } = useContext(AddNodeContext);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Get the current logged-in username from Redux store
  const { username } = useAppSelector((state) => state.user);

  const { dropdownInput, componentList } = state;
  const [dropdownState, setDropdownState] =
    React.useState<SimpleDropdownState>(getInitialState);
  const { isOpen } = dropdownState;
  const [paramFlag, value, type, placeholder] = unPackForKeyValue(
    dropdownInput[id],
  );

  // Check if this is a password field
  const isPasswordField = paramFlag?.toLowerCase().includes("password");

  // Check if there's a username or user field in the form inputs
  const userField = Object.values(dropdownInput || {}).find(
    (input) =>
      input?.flag?.toLowerCase().includes("username") ||
      input?.flag?.toLowerCase().includes("user"),
  );

  // Determine if the entered username matches the logged-in user
  const usernameMatches = userField?.value === username;

  // Determine if we should show the password toggle button
  const shouldShowPasswordToggle = isPasswordField && usernameMatches;

  useEffect(() => {
    if (paramFlag && !value) {
      const input = document.getElementById(paramFlag);
      input?.focus();
    }
  }, [paramFlag, value]);

  const onToggle = () => {
    setDropdownState({
      ...dropdownState,
      isOpen: !isOpen,
    });
  };

  const onSelect = (): void => {
    setDropdownState({
      ...dropdownState,
      isOpen: !isOpen,
    });
  };

  const findUsedParam = () => {
    const usedParam = new Set();

    for (const input in dropdownInput) {
      dropdownInput[input] && usedParam.add(dropdownInput[input].flag);
    }

    return usedParam;
  };

  const handleClick = (param: PluginParameter) => {
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;

    if (params && params.dropdown.length > 0) {
      dispatch({
        type: Types.SetComponentList,
        payload: {
          componentList: [...componentList, v4()],
        },
      });
    }

    dispatch({
      type: Types.DropdownInput,
      payload: {
        input: {
          [id]: {
            flag,
            value: "",
            type,
            placeholder,
          },
        },
        editorValue: false,
      },
    });
  };

  const deleteDropdown = () => {
    dispatch({
      type: Types.DeleteComponentList,
      payload: {
        id,
      },
    });
  };

  const handleInputChange = (e: any) => {
    dispatch({
      type: Types.DropdownInput,
      payload: {
        input: {
          [id]: {
            flag: paramFlag,
            value: e.target.value,
            type,
            placeholder,
          },
        },
        editorValue: false,
      },
    });
  };

  const dropdownItems = () => {
    const useParam = findUsedParam();
    const parameters = params?.dropdown
      .filter(
        (param) =>
          param.data.optional === true && !useParam.has(param.data.flag),
      )
      .map((param) => {
        return (
          <DropdownItem
            key={param.data.id}
            onClick={() => handleClick(param)}
            className="plugin-configuration__parameter"
            value={param.data.flag}
            name={param.data.help}
            style={{ fontFamily: "monospace" }}
          >
            {param.data.flag}
          </DropdownItem>
        );
      });
    return parameters;
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="plugin-configuration">
        <Dropdown
          onSelect={onSelect}
          toggle={(toggleRef) => {
            return (
              <MenuToggle
                ref={toggleRef}
                id="toggle-id"
                onClick={onToggle}
                isDisabled={params && params.dropdown.length === 0}
              >
                <div style={{ fontFamily: "monospace" }}>
                  {paramFlag
                    ? `${paramFlag}`
                    : params && params.dropdown.length === 0
                      ? "No Parameters"
                      : "Choose a Parameter"}
                </div>
              </MenuToggle>
            );
          }}
          isOpen={isOpen}
          className="plugin-configuration__dropdown"
        >
          <DropdownList>{dropdownItems()}</DropdownList>
        </Dropdown>
        <div style={{ display: "flex", flexGrow: 1 }}>
          <TextInput
            id={paramFlag}
            type={isPasswordField && !showPassword ? "password" : "text"}
            aria-label="text"
            className="plugin-configuration__input"
            onChange={handleInputChange}
            placeholder={placeholder}
            value={value}
            isDisabled={
              type === "boolean" || (params && params.dropdown.length === 0)
            }
            style={{ flexGrow: 1 }}
          />
          {shouldShowPasswordToggle && (
            <Button
              variant="plain"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={togglePassword}
              style={{ marginLeft: "4px" }}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </Button>
          )}
        </div>

        <Button variant="link" onClick={deleteDropdown} icon={<CloseIcon />} />
      </div>
    </>
  );
};

const SimpleDropdownMemoed = React.memo(SimpleDropdown);

export default SimpleDropdownMemoed;
