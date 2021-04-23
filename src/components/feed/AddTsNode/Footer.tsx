import React from "react";
import { Button } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import { Space } from "antd";

type FooterProps = {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  selectedTsPlugin?: Plugin;
};

const Footer = ({
  currentStep,
  onBack,
  onNext,
  onCancel,
  selectedTsPlugin,
}: FooterProps) => {
  console.log("CurrentStep:", currentStep);
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
        isDisabled={currentStep === 1 && !selectedTsPlugin ? true : false}
        onClick={onNext}
        type="button"
      >
        Next
      </Button>

      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Space>
  );
};

export default Footer;
