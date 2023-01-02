import { PluginInstance } from "@fnndsc/chrisapi";
import { InputType } from "./ParentContainer";

export const getJoinInput = (
  joinInput: InputType,
  tsNodes?: PluginInstance[]
) => {
  const instanceIds = tsNodes?.map((node) => {
    return `${node.data.id}`;
  });

  let input: InputType = {};

  if (instanceIds) {
    input = {
      ...joinInput,
      ["plugininstances"]: instanceIds.join(","),
    };
  }
  return input || {};
};
