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
  selectedConfig?: string;
};

const Footer = ({
  currentStep,
  onBack,
  onNext,
  onCancel,
  selectedTsPlugin,
  selectedConfig,
}: FooterProps) => (
    <Space>
      <Button
        isDisabled={currentStep === 0}
        onClick={onBack}
        type="button"
      >
        Back
      </Button>
      <Button
        isDisabled={
          !!(currentStep === 1 &&
          selectedConfig === "join-node" &&
          !selectedTsPlugin)
        }
        onClick={onNext}
        type="button"
      >
        {currentStep === 3 ? "Add Node" : "Next"}
      </Button>

      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Space>
  );

export default Footer;
