import React from "react";
import { Title } from "@patternfly/react-core";
import ChooseConfig from "./ChooseConfig";
import Footer from "./Footer";
import Join from "./Join";
import Split from "./Split";
import "./GraphNode.scss";

function getNodeState() {
  return {
    selectedConfig: "join-node",
  };
}

type NodeState = {
  selectedConfig: string;
};

const GraphNode = () => {
  const [stepNumber, setStepNumber] = React.useState(0);
  const [nodeState, setNodeState] = React.useState<NodeState>(getNodeState);
  const { selectedConfig } = nodeState;
  const handleConfig = (value: string) => {
    setNodeState({
      ...nodeState,
      selectedConfig: value,
    });
  };

  const onBack = () => {
    stepNumber > 0 && setStepNumber(stepNumber - 1);
  };

  const onNext = () => {
    setStepNumber(stepNumber + 1);
  };

  const onCancel = () => {
    console.log("clicked");
  };

  const steps = [
    {
      step: 1,
      component: (
        <ChooseConfig
          selectedConfig={selectedConfig}
          handleConfig={handleConfig}
        />
      ),
    },
    {
      step: 2,
      component: selectedConfig === "join-node" ? <Join /> : <Split />,
    },
    {
      step: 3,
    },
  ];

  console.log("StepNumber", stepNumber);

  return (
    <>
      <Title headingLevel="h2">Configure a Graph Node</Title>
      {steps[stepNumber].component}
      <Footer
        currentStep={stepNumber}
        onBack={onBack}
        onNext={onNext}
        onCancel={onCancel}
      />
    </>
  );
};

export default GraphNode;
