import { InputType, InputIndex } from "../types";
import { PluginParameter } from "@fnndsc/chrisapi";

export const unPackForKeyValue = (input: InputIndex) => {
  const key = Object.keys(input)[0];
  const value = input[key];
  return [key, value];
};

export const unpackParametersIntoObject = (input: InputType) => {
  let result: InputIndex = {};
  for (let parameter in input) {
    const [flag, value] = unPackForKeyValue(input[parameter]);
    result[flag] = value;
  }
  return result;
};

export const unpackParametersIntoString = (input: InputType) => {
  let string = "";
  for (let parameter in input) {
    const [flag, value] = unPackForKeyValue(input[parameter]);
    string += `--${flag} ${value} `;
  }
  return string;
};

export const getRequiredParams = (params: PluginParameter[]) => {
  return params
    .map((param) => {
      if (param.data.optional === false) {
        return param.data.name;
      } else return undefined;
    })
    .filter((element) => element !== undefined);
};

export const getAllParamsWithName = (params: PluginParameter[]) => {
  return params.map((param) => param.data.name);
};

export const getRequiredParamsWithId = (params: PluginParameter[]) => {
  return params
    .map((param) => {
      if (param.data.optional === false)
        return `${param.data.name}_${param.data.id}`;
      else return undefined;
    })
    .filter((element) => element !== undefined);
};
