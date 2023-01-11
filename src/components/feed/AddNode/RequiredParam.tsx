import React, { useEffect, useRef } from "react";
import { Form, TextInput } from "@patternfly/react-core";
import { PluginParameter } from "@fnndsc/chrisapi";
import { RequiredParamProp } from "./types";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";

const RequiredParam: React.FC<RequiredParamProp> = ({
  param,
  addParam,
  requiredInput,
  inputChange,
}: RequiredParamProp) => {
  const value =
    requiredInput &&
    requiredInput[param.data.id] &&
    requiredInput[param.data.id]["value"];
  const inputElement = useRef<any>()

  const handleInputChange = (param: PluginParameter, event: any) => {
    const id = `${param.data.id}`;
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const value = event.target.value;
    const paramName = param.data.name;
    inputChange(id, flag, value, type, placeholder, true, paramName);
  };
  
  const triggerChange = (eventType: string) => {
    if (eventType === "keyDown") {
      addParam();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerChange("keyDown");
    }
  };

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [])

  return (
    <Form className="required-params" key={param.data.id}>
      <div className="required-params__layout">
        <div className="required-params__label">
          {`${param.data.flag}:`}
          <span className="required-params__star">*</span>
        </div>
        <span className="required-params__infoLabel">(*Required)</span>
      </div>
    
      <TextInput
         className={css(styles.formControl, `required-params__textInput`)}
         type="text"
         ref={inputElement}
         aria-label="required-parameters"
         onChange={(event: any) => handleInputChange(param, event)}
         onKeyDown={handleKeyDown}
         placeholder={param.data.help}
         value={value}
         id={param.data.name}
      />     
    </Form>
  );
};

export default RequiredParam;