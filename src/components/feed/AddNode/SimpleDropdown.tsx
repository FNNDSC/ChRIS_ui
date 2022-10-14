import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Banner,
} from "@patternfly/react-core";
import { AiFillCaretDown } from "react-icons/ai";
import { PluginParameter } from "@fnndsc/chrisapi";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";
import { MdClose } from "react-icons/md";
import { unPackForKeyValue } from "./lib/utils";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";

function getInitialState() {
  return {
    isOpen: false,
  };
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
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

  const handleClick = (param: PluginParameter) => {
    const {flag} = param.data;
    const placeholder = param.data.help;
    const {type} = param.data;
    const defaultValue = value || param.data.default;
    handleChange(id, flag, defaultValue, type, placeholder, false, paramName);
  };

  const triggerChange = (eventType: string) => {
    if (eventType === "keyDown") {
      addParam();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerChange("keyDown");
    } else return;
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

  const dropdownItems =
    params &&
    params
      .filter((param) => param.data.optional === true)
      .map((param) => {
        const {id} = param.data;
        return (
          <DropdownItem
            key={id}
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
          dropdownItems={
            dropdownItems && dropdownItems.length > 0 ? dropdownItems : []
          }
        />
        <input
          type="text"
          aria-label="text"
          className={css(styles.formControl, `plugin-configuration__input`)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={value}
          disabled={type === "boolean"}
        />

        <div onClick={deleteDropdown} className="close-icon">
          <MdClose />
        </div>
      </div>
      {type === "boolean" && (
        <Banner variant="info">
          Boolean flags don&apos;t require the user to implicitly provide
          values.
        </Banner>
      )}
    </>
  );
};

export default React.memo(SimpleDropdown);
