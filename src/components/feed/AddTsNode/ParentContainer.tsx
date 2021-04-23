import React from "react";
import { Title } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import ChooseConfig from "./ChooseConfig";
import Footer from "./Footer";
import Join from "./Join";
import Split from "./Split";
import ConfigureJoin from "./ConfigureJoin";

import "./GraphNode.scss";

function getNodeState() {
  return {
    selectedConfig: "join-node",
    selectedPlugin: undefined,
  };
}

type NodeState = {
  selectedConfig: string;
  selectedTsPlugin?: Plugin;
};

const GraphNode = () => {
  const [stepNumber, setStepNumber] = React.useState(0);
  const [nodeState, setNodeState] = React.useState<NodeState>(getNodeState);
  const { selectedConfig, selectedTsPlugin } = nodeState;
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

  const handlePluginSelect = (selectedTsPlugin: Plugin) => {
    setNodeState({
      ...nodeState,
      selectedTsPlugin,
    });
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
      component:
        selectedConfig === "join-node" ? (
          <Join
            selectedTsPlugin={selectedTsPlugin}
            handlePluginSelect={handlePluginSelect}
          />
        ) : (
          <Split />
        ),
    },
    {
      step: 3,
      component: <ConfigureJoin selectedTsPlugin={selectedTsPlugin} />,
    },
    {
      step: 4,
      component: <div>Reviewing</div>,
    },
  ];

  const title = [
    "Configure a Graph Node :",
    "Select a 'TS' Node :",
    `Configure ${selectedTsPlugin?.data.name}`,
  ];

  return (
    <>
      <Title headingLevel="h2">{title[stepNumber]}</Title>
      {steps[stepNumber].component}
      <Footer
        currentStep={stepNumber}
        onBack={onBack}
        onNext={onNext}
        onCancel={onCancel}
        selectedTsPlugin={selectedTsPlugin}
      />
    </>
  );
};

export default GraphNode;
