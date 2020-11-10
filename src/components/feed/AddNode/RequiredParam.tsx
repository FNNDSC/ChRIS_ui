import React from "react";
import { Form, Label } from "@patternfly/react-core";
import { PluginParameter } from "@fnndsc/chrisapi";
import {RequiredParamProp} from './types'
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";


const RequiredParam: React.FC<RequiredParamProp> = ({
  param,
  addParam,
  requiredInput,
  inputChange,
}) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const id = `${param.data.id}`;
    const flag = param.data.flag;
    const input = requiredInput[id];
    if (input) {
      setValue(input[flag]);
    }
  }, [requiredInput, param]);

  const handleInputChange = (param: PluginParameter, event: any) => {
    const placeholder = param.data.help;
    const flag = param.data.flag;
    const id = `${param.data.id}`;
    const type = param.data.type;
    const value = event.target.value;
    inputChange(id, flag, value, true, type, placeholder);
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
        <Label className="required-params__label">
          {`${param.data.flag}:`}
          <span className="required-params__star">*</span>
        </Label>
        <Label className="required-params__infoLabel">(*Required)</Label>
      </div>
      <input
        className={css(styles.formControl,  `required-params__textInput`)}
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
