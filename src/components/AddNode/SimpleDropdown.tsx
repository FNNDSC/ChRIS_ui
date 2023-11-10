import React, { useContext, useEffect } from "react";
import {
  Dropdown,
  MenuToggle,
  DropdownItem,
  DropdownList,
  TextInput,
} from "@patternfly/react-core";
import CloseIcon from "@patternfly/react-icons/dist/esm/icons/close-icon";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./utils";
import { PluginParameter } from "@fnndsc/chrisapi";

import { AddNodeContext } from "./context";
import { Types } from "./types";
import { v4 } from "uuid";

function getInitialState() {
  return {
    isOpen: false,
  };
}

const SimpleDropdown = ({ id, params }: SimpleDropdownProps) => {
  const { state, dispatch } = useContext(AddNodeContext);

  const { dropdownInput, componentList } = state;
  const [dropdownState, setDropdownState] =
    React.useState<SimpleDropdownState>(getInitialState);
  const { isOpen } = dropdownState;
  const [paramFlag, value, type, placeholder] = unPackForKeyValue(
    dropdownInput[id]
  );

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

    if (params && params["dropdown"].length > 0) {
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
    const parameters =
      params &&
      params["dropdown"]
        .filter(
          (param) =>
            param.data.optional === true && !useParam.has(param.data.flag)
        )
        .map((param) => {
          return (
            <DropdownItem
              key={param.data.id}
              onClick={() => handleClick(param)}
              className="plugin-configuration__parameter"
              value={param.data.flag}
              name={param.data.help}
            >
              {param.data.flag}
            </DropdownItem>
          );
        });
    return parameters;
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
                isDisabled={params && params["dropdown"].length == 0}
              >
                {paramFlag
                  ? `${paramFlag}`
                  : params && params["dropdown"].length == 0
                  ? "No Parameters"
                  : "Choose a Parameter"}
              </MenuToggle>
            );
          }}
          isOpen={isOpen}
          className="plugin-configuration__dropdown"
        >
          <DropdownList>{dropdownItems()}</DropdownList>
        </Dropdown>
        <TextInput
          id={paramFlag}
          type="text"
          aria-label="text"
          className="plugin-configuration__input"
          onChange={handleInputChange}
          placeholder={placeholder}
          value={value}
          isDisabled={
            type === "boolean" || (params && params["dropdown"].length == 0)
          }
        />

        <div onClick={deleteDropdown}>
          <CloseIcon />
        </div>
      </div>
    </>
  );
};

const SimpleDropdownMemoed = React.memo(SimpleDropdown);

export default SimpleDropdownMemoed;
