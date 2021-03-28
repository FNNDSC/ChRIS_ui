import React from "react";
import { Form } from "@patternfly/react-core";
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
    (requiredInput &&
      requiredInput[param.data.flag] &&
      requiredInput[param.data.flag]["value"]) ||
    "";

  const handleInputChange = (param: PluginParameter, event: any) => {
    const id = param.data.flag;;
    const placeholder = param.data.help;
    const type = param.data.type;
    const value = event.target.value;
    inputChange(id, value, type, placeholder, true);
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

  return (
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
        aria-label="required-parameters"
        onChange={(event: any) => handleInputChange(param, event)}
        onKeyDown={handleKeyDown}
        placeholder={param.data.help}
        value={value}
      />
    </Form>
  );
};

export default RequiredParam;
