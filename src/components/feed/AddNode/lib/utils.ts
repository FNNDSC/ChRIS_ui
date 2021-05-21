import { InputType, InputIndex } from "../types";
import { PluginParameter } from "@fnndsc/chrisapi";

export const unPackForKeyValue = (input: InputIndex) => {
  const flag = input ? input["flag"] : "";
  const value = input ? input["value"] : "";
  const type = input ? input["type"] : "";
  const placeholder = input ? input["placeholder"] : "";
  return [flag, value, type, placeholder];
};

export const unpackParametersIntoObject = (input: InputType) => {
  const result: {
    [key: string]: {
      [key: string]: string;
    };
  } = {};
  for (const parameter in input) {
    const [flag, value, type] = unPackForKeyValue(input[parameter]);
    result[flag] = {
      value,
      type,
    };
  }

  return result;
};

export const unpackParametersIntoString = (input: InputType) => {
  let string = "";

  for (const parameter in input) {
    const flag = input[parameter].flag;
    const value = input[parameter].value;
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
  flag: string,
  value: string,
  type: string,
  placeholder: string
) => {
  const result: InputIndex = {};
  result["flag"] = flag;
  result["value"] = value;
  result["type"] = type;
  result["placeholder"] = placeholder;
  return result;
};

export function getRequiredParamsWithName(
  flag: string,
  value: string,
  type: string,
  placeholder: string
) {
  const result: InputIndex = {};
  result["flag"] = flag;
  result["value"] = value;
  result["type"] = type;
  result["placeholder"] = placeholder;
  return result;
}
