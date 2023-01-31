import React, { useContext, useEffect, useRef } from "react";
import { Form } from "@patternfly/react-core";
import { PluginParameter } from "@fnndsc/chrisapi";
import { RequiredParamProp } from "./types";
import styles from "@patternfly/react-styles/css/components/FormControl/form-control";
import { css } from "@patternfly/react-styles";
import { AddNodeContext } from "./context";
import { Types } from "./types";

const RequiredParam: React.FC<RequiredParamProp> = ({
  param,
}: RequiredParamProp) => {
  const { state, dispatch } = useContext(AddNodeContext);
  const { requiredInput } = state;
  const value =
    requiredInput &&
    requiredInput[param.data.id] &&
    requiredInput[param.data.id]["value"];
  const inputElement = useRef<any>();

  const handleInputChange = (param: PluginParameter, event: any) => {
    event.preventDefault();
    const id = `${param.data.id}`;
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;
    const value = event.target.value;

    dispatch({
      types: Types.RequiredInput,
      payload: {
        input: {
          [id]: {
            value,
            flag,
            placeholder,
            type,
          },
        },
        editorValue: false,
      },
    });
  };

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, []);

  return (
    <Form
      onSubmit={(event: any) => {
        event.preventDefault();
      }}
      className="required-params"
      key={param.data.id}
    >
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
        placeholder={param.data.help}
        value={value}
        id={param.data.name}
      />
    </Form>
  );
};

export default RequiredParam;
