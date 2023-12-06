import React, { useContext, useEffect, useRef } from "react";
import { Form, FormGroup, TextInput } from "@patternfly/react-core";
import type { PluginParameter } from "@fnndsc/chrisapi";
import { RequiredParamProp } from "./types";
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

  const handleInputChange = (param: PluginParameter, value: string) => {
    const id = `${param.data.id}`;
    const flag = param.data.flag;
    const placeholder = param.data.help;
    const type = param.data.type;

    dispatch({
      type: Types.RequiredInput,
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
      isHorizontal
    >
      <FormGroup style={{ width: "100%" }} isRequired label={param.data.flag}>
        <TextInput
          className="required-params__textInput"
          ref={inputElement}
          type="text"
          aria-label="required-parameters"
          placeholder={param.data.help}
          value={value ? value : ""}
          id={param.data.name}
          onChange={(_event, value: string) => handleInputChange(param, value)}
        />
      </FormGroup>
    </Form>
  );
};

export default RequiredParam;
