import { Form, FormGroup, TextInput } from "@patternfly/react-core";
import type React from "react";
import { type FormEvent, useContext, useEffect, useRef } from "react";
import { AddNodeContext } from "./context";
import type { RequiredParamProp } from "./types";
import { Types } from "./types";

const RequiredParam: React.FC<RequiredParamProp> = ({ param }) => {
  const { state, dispatch } = useContext(AddNodeContext);
  const { requiredInput } = state;
  const inputElement = useRef<HTMLInputElement>(null);

  const value = requiredInput?.[param.data.id]?.value ?? "";

  const handleInputChange = (value: string) => {
    const { id, flag, help: placeholder, type } = param.data;

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
    inputElement.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={handleSubmit} className="required-params" isHorizontal>
      <FormGroup style={{ width: "100%" }} isRequired label={param.data.flag}>
        <TextInput
          className="required-params__textInput"
          ref={inputElement}
          type="text"
          aria-label="required-parameters"
          placeholder={param.data.help}
          value={value}
          id={param.data.name}
          onChange={(_e, value: string) => handleInputChange(value)}
        />
      </FormGroup>
    </Form>
  );
};

export default RequiredParam;
