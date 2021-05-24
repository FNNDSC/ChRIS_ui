import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Banner,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import TrashAltIcon from "@patternfly/react-icons/dist/js/icons/trash-alt-icon";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./lib/utils";
import { PluginParameter } from "@fnndsc/chrisapi";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";


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

  const [paramFlag, value, type, placeholder] = unPackForKeyValue(
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
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;

    handleChange(id, flag, value, type, placeholder, false);
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
    handleChange(id, paramFlag, e.target.value, type, placeholder, false);
  };

  const dropdownItems =
    params &&
    params
      .filter((param) => param.data.optional === true)
      .map((param) => {
        const id = param.data.id;
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
              toggleIndicator={CaretDownIcon}
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
          disabled={type==='boolean'}
        />

        <div className="close-icon">
          <TrashAltIcon onClick={deleteDropdown} />
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
