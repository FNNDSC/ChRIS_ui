import React, { useEffect } from "react";
import { Dropdown, DropdownToggle, DropdownItem } from "@patternfly/react-core";
import { AiFillCaretDown } from "react-icons/ai";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./lib/utils";
import { PluginParameter } from "@fnndsc/chrisapi";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";
import { MdClose } from "react-icons/md";

function getInitialState() {
  return {
    isOpen: false,
  };
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  defaultValueDisplay,
  dropdownInput,
  id,
  params,
  handleChange,
  addParam,
  deleteInput,
  deleteComponent,
}: SimpleDropdownProps) => {
  const [dropdownState, setDropdownState] =
    React.useState<SimpleDropdownState>(getInitialState);
  const { isOpen } = dropdownState;
  const [paramFlag, value, type, placeholder, paramName] = unPackForKeyValue(
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
      usedParam.add(dropdownInput[input].flag);
    }
    return usedParam;
  };

  const handleClick = (param: PluginParameter) => {
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const defaultValue = value
      ? value
      : defaultValueDisplay
      ? param.data.default
      : "";
    addParam();
    handleChange(id, flag, defaultValue, type, placeholder, false, paramName);
  };

  const deleteDropdown = () => {
    deleteInput(id);
    deleteComponent(id);
  };

  const handleInputChange = (e: any) => {
    handleChange(
      id,
      paramFlag,
      e.target.value,
      type,
      placeholder,
      false,
      paramName
    );
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
              toggleIndicator={AiFillCaretDown}
            >
              {paramFlag ? `${paramFlag}` : "Choose a Parameter"}
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
          disabled={type === "boolean"}
        />

        <div onClick={deleteDropdown} className="close-icon">
          <MdClose />
        </div>
      </div>
    </>
  );
};

export default React.memo(SimpleDropdown);
