import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  TextInput,
  Banner,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import TrashAltIcon from "@patternfly/react-icons/dist/js/icons/trash-alt-icon";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./lib/utils";
import { PluginParameter } from "@fnndsc/chrisapi";
import { v4 } from "uuid";

function getInitialState() {
  return {
    isOpen: false,
    paramFlag: "",
    paramValue: "",
    placeholder: "",
    type: "",
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
  const [dropdownState, setDropdownState] = React.useState<SimpleDropdownState>(
    getInitialState
  );
  const { isOpen, paramFlag, paramValue, placeholder, type } = dropdownState;

  React.useEffect(() => {
    if (!dropdownInput || !dropdownInput[id]) return;
    const [flag, value, type, placeholder] = unPackForKeyValue(
      dropdownInput[id]
    );

    setDropdownState((dropdownState) => {
      return {
        ...dropdownState,
        paramFlag: flag,
        paramValue: value,
        type,
        placeholder,
      };
    });
  }, [dropdownInput, id]);

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

    handleChange(id, flag, paramValue, type, placeholder, false);
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

  const handleInputChange = (value: string) => {
    handleChange(id, paramFlag, value, type, placeholder, false);
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
        <TextInput
          type="text"
          aria-label="text"
          className="plugin-configuration__input"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={paramValue}
          isDisabled={type === "boolean"}
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

export default SimpleDropdown;
