import { InputType, InputIndex } from "../types";
import { PluginParameter } from "@fnndsc/chrisapi";

export const unPackForKeyValue = (input: InputIndex) => {
  const flag = Object.keys(input)[1];
  const value = input[flag];
  const type = input["type"];
  const placeholder = input["placeholder"];
  const index = input["id"];

  return [index, flag, value, type, placeholder];
};

export const unpackParametersIntoObject = (input: InputType) => {
  let result: {
    [key: string]: {
      [key: string]: string;
    };
  } = {};
  for (let parameter in input) {
    const [, flag, value, type, ,] = unPackForKeyValue(input[parameter]);
    result[flag] = {
      value,
      type,
    };
  }

  return result;
};

export const unpackParametersIntoString = (input: InputType) => {
  let string = "";
  for (let parameter in input) {
    const [, flag, value, ,] = unPackForKeyValue(input[parameter]);
    string += `${flag} ${value} `;
  }
  return string;
};

export const getRequiredParams = (params: PluginParameter[]) => {
  return params
    .map((param) => {
      if (param.data.optional === false) {
        return param.data.flag;
      } else return undefined;
    })
    .filter((element) => element !== undefined);
};

export const getAllParamsWithName = (
  id: string,
  flag: string,
  value: string,
  type: string,
  placeholder: string
) => {
  let result: InputIndex = {};
  result['id']=id;
  result[flag] = value;
  result["type"] = type;
  result["placeholder"] = placeholder;
  return result;
};

export function getRequiredParamsWithName(
  id: string,
  flag: string,
  value: string,
  type: string,
  placeholder: string
) {
  let result: InputIndex = {};
  result['id']=id;
  result[flag] = value;
  result["type"] = type;
  result["placeholder"] = placeholder;
  return result;
}
