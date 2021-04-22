import React from "react";
import { Button } from "@patternfly/react-core";
import { Space } from "antd";

type FooterProps = {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
};

const Footer = ({ currentStep, onBack, onNext, onCancel }: FooterProps) => {
  return (
    <Space>
      <Button onClick={onNext} type="button">
        Next
      </Button>
      <Button
        isDisabled={currentStep === 0 ? true : false}
        onClick={onBack}
        type="button"
      >
        Back
      </Button>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Space>
  );
};

export default Footer;
