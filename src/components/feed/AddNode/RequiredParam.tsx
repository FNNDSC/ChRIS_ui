import React, { useEffect, useRef } from "react";
import { Form, WizardContextConsumer } from "@patternfly/react-core";
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
  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus()
    }
  }, [])
  const handleInputChange = (param: PluginParameter, event: any) => {
    const id = `${param.data.id}`;
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const value = event.target.value;
    const paramName = param.data.name;
    inputChange(id, flag, value, type, placeholder, true, paramName);
  };
 
  const handleKeyDown = (e: any, next: () => void, prev: () => void) => {
    if (e.code == "Enter" || e.code == "ArrowRight") {
      e.preventDefault()
      next()
     }else if(e.code == "ArrowLeft"){
      e.preventDefault()
      prev()
     }
  };

  return (
    <WizardContextConsumer>
      {({ onNext,
          onBack,
      }: {
        onNext: any;
        onBack: any;
      }) => (
        <Form className="required-params" key={param.data.id}>
          <div className="required-params__layout">
            <div className="required-params__label">
              {`${param.data.flag}:`}
              <span className="required-params__star">*</span>
            </div>
            <span className="required-params__infoLabel">(*Required)</span>
          </div>
          <input
            className={css(styles.formControl, `required-params__textInput`)}
            type="text"
            ref={inputElement}
            aria-label="required-parameters"
            onChange={(event: any) => handleInputChange(param, event)}
            onKeyDown={(e) => handleKeyDown(e, onNext, onBack)}
            placeholder={param.data.help}
            value={value}
            id={param.data.name}
          />
        </Form>
      )}

    </WizardContextConsumer>
  );
};

export default RequiredParam;
