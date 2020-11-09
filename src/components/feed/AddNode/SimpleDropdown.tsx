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



function getInitialState(){
  return{
      isOpen: false,
      paramId: "",
      paramValue: "",
      flag: "",
      placeholder: "",
      type: "",
  }
}

const SimpleDropdown:React.FC<SimpleDropdownProps>=({
    dropdownInput,
    id,
    params,
    handleChange,
    addParam,
    deleteInput, 
    deleteComponent
  })=>{

    const [dropdownState,setDropdownState]=React.useState<SimpleDropdownState>(getInitialState)
    const {
      isOpen,
      paramId,
      paramValue,
      flag,
      placeholder,
      type
    }=dropdownState

  React.useEffect(()=>{
 
    if(!dropdownInput || !dropdownInput[id]) return;
      const [index, flag, value, type, placeholder] = unPackForKeyValue(
        dropdownInput[id]
      );

      setDropdownState((dropdownState) => {
        return {
          ...dropdownState,
          paramId: index,
          flag,
          paramValue:value,
          type,
          placeholder,
        };
      });

  },[dropdownInput,id])

  const onToggle =(isOpen: boolean)=> {
    setDropdownState({
      ...dropdownState,
      isOpen,
    });
  }

  const onSelect=(event?: React.SyntheticEvent<HTMLDivElement>): void=> {
    setDropdownState({
      ...dropdownState,
      isOpen: !isOpen,
    });
  }

  const handleClick=(param: PluginParameter)=>{
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const paramId = `${param.data.id}`;

    setDropdownState(
         {
          ...dropdownState,
          paramId,
          flag,
          placeholder,
          type,
        }
     )

    handleChange(
          paramId,
          flag,
          paramValue,
          false,
          type,
          placeholder
    );
   }
    

  const triggerChange = (eventType: string) => {
    if (eventType === "keyDown") {
     addParam();
    }
   
  }

  const handleKeyDown=(event: React.KeyboardEvent<HTMLInputElement>)=> {
    if (event.key === "Enter") {
      triggerChange("keyDown",);
    } else return;
  }

  const deleteDropdown=()=> {
    deleteInput(id);
    deleteComponent(id);
  }

  const handleInputChange=(value: string, event: React.FormEvent<HTMLInputElement>)=> {
  handleChange(paramId, flag, value, false, type, placeholder);
  }

  const dropdownItems = params && params
      .filter(param => param.data.optional === true)
      .map(param => {
        const id = param.data.id;
        return (
          <DropdownItem
            key={id}
            onClick={() =>handleClick(param)}
            component="button"
            className="plugin-configuration__parameter"
            value={param.data.flag}
            name={param.data.help}
          >
            {param.data.flag}
          </DropdownItem>
        );
      });

  return(
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
                {flag ? `${flag}` : "Choose a Parameter"}
              </DropdownToggle>
            }
            isOpen={isOpen}
            className="plugin-configuration__dropdown"
            dropdownItems={dropdownItems && dropdownItems.length > 0 ? dropdownItems : []}
          />
          <TextInput
            type="text"
            aria-label="text"
            className="plugin-configuration__input"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            value={paramValue}
            isDisabled={type ==="boolean"}
          />

          <div className="close-icon">
            <TrashAltIcon onClick={deleteDropdown} />
          </div>
        </div>
        {type === "boolean" && (
          <Banner variant="info">
            Input boxes are disabled for boolean values. Choose the flags to add
            to run your plugin.
          </Banner>
        )}
      </>
  )
}

export default SimpleDropdown;