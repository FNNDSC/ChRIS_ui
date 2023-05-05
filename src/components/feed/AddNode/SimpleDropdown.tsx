import React, { useContext, useEffect } from "react";
import { Dropdown, DropdownToggle, DropdownItem } from "@patternfly/react-core";
import { AiFillCaretDown } from "react-icons/ai";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./lib/utils";
import { PluginParameter } from "@fnndsc/chrisapi";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";
import { MdClose } from "react-icons/md";
import { AddNodeContext } from "./context";
import { Types } from "./types";
import { v4 } from "uuid";

function getInitialState() {
  return {
    isOpen: false,
  };
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  id,
  params,
}: SimpleDropdownProps) => {
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

  const onToggle = (isOpen: boolean) => {
    setDropdownState({
      ...dropdownState,
      isOpen,
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
              component="button"
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
          toggle={
            <DropdownToggle
              id="toggle-id"
              onToggle={onToggle}
              isDisabled = {params && params["dropdown"].length == 0}
              toggleIndicator={AiFillCaretDown}
            >
              {paramFlag ? `${paramFlag}` : params && params["dropdown"].length == 0? "No Parameters" :"Choose a Parameter"}
            </DropdownToggle>
          }
          isOpen={isOpen}
          className="plugin-configuration__dropdown"
          dropdownItems={dropdownItems()}
        />
        <input
          id={paramFlag}
          type="text"
          aria-label="text"
          className={css(styles.formControl, `plugin-configuration__input`)}
          onChange={handleInputChange}
          placeholder={placeholder}
          value={value}
          disabled={type === "boolean" || params && params["dropdown"].length == 0}
        />

        <div onClick={deleteDropdown}>
          <MdClose />
        </div>
      </div>
    </>
  );
};

export default React.memo(SimpleDropdown);
