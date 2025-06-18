import type { InputType, InputIndex } from "./types";
import type { PluginParameter } from "@fnndsc/chrisapi";
import { v4 } from "uuid";

export const unPackForKeyValue = (input: InputIndex) => {
  const flag = input ? input.flag : "";
  const value = input ? input.value : "";
  const type = input ? input.type : "";
  const placeholder = input ? input.placeholder : "";
  return [flag, value, type, placeholder];
};

export const unpackParametersIntoObject = (input: InputType) => {
  const result: {
    [key: string]: {
      value: string;
      type: string;
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

    // Check if this is a password parameter and mask it with asterisks for display
    const isPassword = flag?.toLowerCase().includes("password");
    const displayValue = isPassword
      ? "*".repeat(value ? value.length : 0)
      : value;

    string += `${flag} ${displayValue} `;
  }

  return string;
};

export const getRequiredParams = (params: PluginParameter[]) => {
  return params
    .map((param) => {
      if (param.data.optional === false) {
        return param.data.flag;
      }
    })
    .filter((element) => element !== undefined);
};

export const getAllParamsWithName = (
  flag: string,
  value: string,
  type: string,
  placeholder: string,
) => {
  const result: InputIndex = {};
  result.flag = flag;
  result.value = value;
  result.type = type;
  result.placeholder = placeholder;
  return result;
};

export function getRequiredParamsWithName(
  flag: string,
  value: string,
  type: string,
  placeholder: string,
) {
  const result: InputIndex = {};
  result.flag = flag;
  result.value = value;
  result.type = type;
  result.placeholder = placeholder;
  return result;
}

export const handleGetTokens = (
  value: string,
  params: {
    required: PluginParameter[];
    dropdown: PluginParameter[];
  },
) => {
  const totalParams = [...params.required, ...params.dropdown];
  const userValue = value.trim();
  const lookupTable: InputIndex = {};
  const dictionary: InputIndex = {};
  let requiredInput: InputType = {};
  let dropdownInput: InputType = {};
  let specialCharIndex = undefined;

  const flags = totalParams?.map((param) => param.data.flag);
  const helperValues = totalParams?.map((param) => {
    return {
      id: param.data.id,
      flag: param.data.flag,
      placeholder: param.data.help,
      type: param.data.type,
      required: param.data.optional,
      value: "",
    };
  });

  const values = userValue.match(/(?:[^\s'"]+|"[^"]*"|'[^']*')+/g) || [];
  for (let i = 0; i < values.length; i++) {
    const currentValue = values[i];
    if (
      flags?.includes(currentValue) &&
      (currentValue.startsWith("--") || currentValue.startsWith("-")) &&
      !specialCharIndex
    ) {
      if (!lookupTable[currentValue]) {
        lookupTable[i] = currentValue;
        dictionary[currentValue] = "";
      }
    } else {
      const previousIndex = i > 0 ? i - 1 : i;
      if (specialCharIndex || specialCharIndex === 0) {
        const flag = lookupTable[specialCharIndex];
        if (flag) {
          dictionary[flag] += ` ${currentValue}`;
        }
      }

      // current value doesn't seem to be a flag
      // Check if previous index was a flag
      if (currentValue.startsWith("\\'") || currentValue === "\\'") {
        specialCharIndex = previousIndex;
      }

      if (currentValue.endsWith("\\'") || currentValue === "\\'") {
        specialCharIndex = undefined;
      }

      if (lookupTable[previousIndex]) {
        const flag = lookupTable[previousIndex];
        dictionary[flag] += currentValue;
      }
    }
  }

  for (const flag in dictionary) {
    const input: InputIndex = {};
    const value = dictionary[flag];
    const findValue = helperValues?.find((param) => param.flag === flag);
    if (findValue) {
      input.flag = flag;
      input.placeholder = findValue.placeholder;
      input.type = findValue.type;
      input.value = value;

      if (findValue.required) {
        dropdownInput = {
          ...dropdownInput,
          [v4()]: input,
        };
      } else
        requiredInput = {
          ...requiredInput,
          [findValue.id]: input,
        };
    }
  }

  return {
    optional: dropdownInput,
    nonOptional: requiredInput,
  };
};
