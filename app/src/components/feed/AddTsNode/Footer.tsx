import React from "react";
import { Button } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import { Space } from "antd";
import { useTypedSelector } from "../../../store/hooks";

export type InputType = {
  [key: string]: string | boolean;
};
type FooterProps = {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  selectedTsPlugin?: Plugin;
  selectedConfig?: string;
  splitInput: InputType;
};

const Footer = ({
  currentStep,
  onBack,
  onNext,
  onCancel,
  selectedTsPlugin,
  selectedConfig,
  splitInput,
}: FooterProps) => {
  const { tsNodes } = useTypedSelector((state) => state.tsPlugins);

  return (
    <Space>
      <Button
        isDisabled={currentStep === 0 ? true : false}
        onClick={onBack}
        type="button"
      >
        Back
      </Button>
      <Button
        isDisabled={
          (currentStep === 1 &&
            selectedConfig === "join-node" &&
            !selectedTsPlugin) ||
          (currentStep === 2 &&
            selectedConfig === "join-node" &&
            tsNodes &&
            tsNodes.length === 0) ||
          (currentStep === 2 &&
            selectedConfig === "split-node" &&
            Object.keys(splitInput).length === 0)
            ? true
            : false
        }
        onClick={onNext}
        type="button"
      >
        {currentStep === 2 ? "Add Node" : "Next"}
      </Button>

      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Space>
  );
};

export default Footer;
