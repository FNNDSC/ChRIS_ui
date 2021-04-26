import React from "react";
import { Title } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import ChooseConfig from "./ChooseConfig";
import Footer from "./Footer";
import Join from "./Join";
import Split from "./Split";
import ConfigureJoin from "./ConfigureJoin";
import Review from "./Review";
import { getJoinInput } from "./utils";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import Client from "../../../api/chrisapiclient";

import "./GraphNode.scss";
import {
  addNodeRequest,
  addSplitNodes,
  switchTreeMode,
} from "../../../store/feed/actions";

function getNodeState() {
  return {
    selectedConfig: "join-node",
    selectedTsPlugin: undefined,
    joinInput: {},
    splitInput: {},
  };
}

export type InputType = {
  [key: string]: string | boolean;
};

export type NodeState = {
  selectedConfig: string;
  selectedTsPlugin?: Plugin;
  joinInput: InputType;
  splitInput: InputType;
};

const GraphNode = () => {
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const tsNodes = useTypedSelector((state) => state.feed.tsNodes);
  const nodes = useTypedSelector((state) => state.feed.pluginInstances);
  const dispatch = useDispatch();
  const [stepNumber, setStepNumber] = React.useState(0);
  const [nodeState, setNodeState] = React.useState<NodeState>(getNodeState);
  const { selectedConfig, selectedTsPlugin, joinInput, splitInput } = nodeState;
  const handleConfig = (value: string) => {
    setNodeState({
      ...nodeState,
      selectedConfig: value,
    });
  };

  const onBack = () => {
    stepNumber > 0 && setStepNumber(stepNumber - 1);
  };

  const handleAdd = async () => {
    const { joinInput, selectedConfig } = nodeState;
    const input = getJoinInput(joinInput, tsNodes, selectedPlugin);

    if (selectedPlugin) {
      if (selectedConfig === "join-node") {
        const finalParameterList = {
          ...input,
          ["previous_id"]: `${selectedPlugin.data.id}`,
        };

        const pluginInstance = await selectedTsPlugin?.getPluginInstances();

        try {
          await pluginInstance?.post(finalParameterList);
          const node = pluginInstance?.getItems()[0];
          dispatch(addNodeRequest({ pluginItem: node, nodes: nodes.data }));
          dispatch(switchTreeMode(false));
        } catch (error) {
          console.log("ERROR", error);
        }
      } else {
        const client = Client.getClient();
        //@ts-ignores
        const node = await client.createPluginInstanceSplit(
          selectedPlugin.data.id,
          splitInput["filter"] as string,
          splitInput["compute_resource"] as string
        );
        const instanceIds = node.data.created_plugin_inst_ids.split(',');
        console.log("instanceIds", instanceIds)
        const splitNodes = [];

        for (const i in instanceIds) {
          const id = instanceIds[i];
          console.log("ID", id);
          const pluginInstance = await client.getPluginInstance(+id);
          splitNodes.push(pluginInstance);
        }
        dispatch(addSplitNodes({  splitNodes, nodes:  nodes.data, selectedPlugin  }));
        dispatch(switchTreeMode(false));
      }
    }
  };

  const onNext = () => {
    console.log("StepNumber", stepNumber);
    if (stepNumber === 1 && selectedConfig === "split-node") {
      setStepNumber(stepNumber + 2);
    } else if (stepNumber === 3) {
      handleAdd();
    } else stepNumber < 3 && setStepNumber(stepNumber + 1);
  };

  const onCancel = () => {
    console.log("clicked");
  };

  const handleSplitChange = (value: string, name: string) => {
    setNodeState({
      ...nodeState,
      splitInput: {
        ...nodeState.splitInput,
        [name]: value,
      },
    });
  };

  const handleValueChange = (value: string, name: string) => {
    setNodeState({
      ...nodeState,
      joinInput: {
        ...nodeState.joinInput,
        [name]: value,
      },
    });
  };

  const handleCheckboxChange = (value: boolean, name: string) => {
    setNodeState({
      ...nodeState,
      joinInput: {
        ...nodeState.joinInput,
        [name]: value,
      },
    });
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
          <Split
            splitInput={splitInput}
            handleSplitChange={handleSplitChange}
          />
        ),
    },
    {
      step: 3,
      component: (
        <ConfigureJoin
          handleValueChange={handleValueChange}
          handleCheckboxChange={handleCheckboxChange}
          selectedTsPlugin={selectedTsPlugin}
          joinInput={joinInput}
        />
      ),
    },
    {
      step: 4,
      component: <Review nodeState={nodeState} />,
    },
  ];

  const title = [
    "Configure a Graph Node :",
    `${
      selectedConfig === "join-node"
        ? "Select a 'TS' Node :"
        : "Configure Split Operation on " + selectedPlugin?.data.title ||
          selectedPlugin?.data.plugin_name + ":"
    }`,
    `Configure ${selectedTsPlugin?.data.name}`,
    "Review",
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
        selectedConfig={selectedConfig}
      />
    </>
  );
};

export default GraphNode;
