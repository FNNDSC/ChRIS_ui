import React from "react";
import { Radio, Title } from "@patternfly/react-core";

type ChooseConfig = {
  selectedConfig: string;
  handleConfig: (value: string) => void;
};

const ChooseConfig: React.FC<ChooseConfig> = ({
  selectedConfig,
  handleConfig,
}: ChooseConfig) => {
  return (
    <>
      <Radio
        onChange={(_, event) => {
          handleConfig(event.currentTarget.value);
        }}
        isChecked={selectedConfig === "join-node"}
        value="join-node"
        name="join-node"
        id="radio"
        label="Join Nodes"
        description="The allows you to join nodes"
      />
      <Radio
        onChange={(_, event) => {
          handleConfig(event.currentTarget.value);
        }}
        isChecked={selectedConfig === "split-node"}
        value="split-node"
        name="split-node"
        id="split"
        label="Split Nodes"
        description="This allows you to split nodes"
      />
    </>
  );
};

export default ChooseConfig;
