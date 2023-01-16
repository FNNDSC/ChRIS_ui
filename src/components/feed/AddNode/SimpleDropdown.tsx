import React, { useCallback, useEffect } from "react";
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
    isOpen: true,
  };
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  defaultValueDisplay,
  dropdownInput,
  id,
  params,
  componentList,
  index,
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

  const handleClick = useCallback((param: PluginParameter) => {
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const defaultValue = value
      ? value
      : defaultValueDisplay
      ? param.data.default
      : "";
    handleChange(id, flag, defaultValue, type, placeholder, false, paramName);
  }, [defaultValueDisplay, handleChange, id, paramName, value]);

  const triggerChange = (eventType: string) => {
    if (eventType === "keyDown") {
      addParam();
    }
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
  const findUsedParam = useCallback(() => {
    const usedParam = new Set()
     for(const input in dropdownInput){
        usedParam.add(dropdownInput[input].flag)
     }
     return usedParam
  },[dropdownInput])
  const dropdownItems = useCallback(() => {
    const usedParam = findUsedParam()
    const items = params &&
    params
      .filter((param) => param.data.optional === true && !usedParam.has(param.data.flag) )
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
      return items;
  }, [findUsedParam, handleClick, params])

  const allDrowdownsFilled = useCallback(() => {
    for(const input of componentList){
        if(!(dropdownInput[input] && dropdownInput[input].flag && dropdownInput[input].value)){
         return false; 
        }
    }
    return true; 
 }, [dropdownInput, componentList])
 useEffect(() => {
      const remParam = dropdownItems();
      const keys = Object.keys(dropdownInput); 
      const isLastElem = keys[keys.length-1] == id
      if(remParam?.length != 0 && isLastElem  && allDrowdownsFilled()){
         addParam()
      }
 }, [dropdownInput, addParam, dropdownItems, id, allDrowdownsFilled])
   
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerChange("keyDown");
    } else return
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
          dropdownItems={
            dropdownItems() 
          }
        />
        <input
          type="text"
          aria-label="text"
          className={css(styles.formControl, `plugin-configuration__input`)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled = {!!!dropdownInput[id]?.flag}
          value={value}
        />

        <div onClick={deleteDropdown} className="close-icon">
        {index > 0 && <MdClose />}
        </div>
      </div>
    </>
  );
};

export default React.memo(SimpleDropdown);
