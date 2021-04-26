import React from "react";
import { Title } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import ChooseConfig from "./ChooseConfig";
import Footer from "./Footer";
import Join from "./Join";
import Split from "./Split";
import ConfigureJoin from "./ConfigureJoin";
import Review from "./Review";
import { getInput } from "./utils";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import Client from '../../../api/chrisapiclient'

import "./GraphNode.scss";
import { addNodeRequest, switchTreeMode } from "../../../store/feed/actions";

function getNodeState() {
  return {
    selectedConfig: "join-node",
    selectedTsPlugin: undefined,
    joinInput: {},
  };
}

export type InputType = {
  [key: string]: string | boolean;
};

export type NodeState = {
  selectedConfig: string;
  selectedTsPlugin?: Plugin;
  joinInput: InputType;
};

const GraphNode = () => {
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const tsNodes = useTypedSelector((state) => state.feed.tsNodes);
  const nodes = useTypedSelector((state) => state.feed.pluginInstances);
  const dispatch = useDispatch();
  const [stepNumber, setStepNumber] = React.useState(0);
  const [nodeState, setNodeState] = React.useState<NodeState>(getNodeState);
  const { selectedConfig, selectedTsPlugin, joinInput } = nodeState;
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
    console.log("Handing Add", nodeState.joinInput);
    const { joinInput } = nodeState;
    const input = getInput(joinInput, tsNodes, selectedPlugin);

    if (selectedPlugin) {
      const finalParameterList = {
        ...input,
        ["previous_id"]: `${selectedPlugin.data.id}`,
      };

      const testList = {
        "filter":"\.pdf$",
        "cr_name":"host",
        "pluginInstanceId":+selectedPlugin.data.id
      }
     

      const pluginInstance = await selectedTsPlugin?.getPluginInstances();

      try {
        /*
        await pluginInstance?.post(finalParameterList);
        const node = pluginInstance?.getItems()[0];
       */

        //@ts-ignore
        const client=Client.getClient();
         //@ts-ignore
        const test=await client.createPluginInstanceSplit(
          selectedPlugin.data.id, '\.pdf$','host'
        )

        console.log("test",test )

      





       // dispatch(addNodeRequest({ pluginItem: node, nodes: nodes.data }));
        dispatch(switchTreeMode(false));
      } catch (error) {
        console.log("ERROR", error);
      }
    }
  };

  const onNext = () => {
    stepNumber < 3 && setStepNumber(stepNumber + 1);
    if (stepNumber === 3) {
      handleAdd();
    }
  };

  const onCancel = () => {
    console.log("clicked");
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
          <Split />
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
    `${selectedConfig==='join-node' ? "Select a 'TS' Node :" : "Configure Split Operation on " + selectedPlugin?.data.title || selectedPlugin?.data.plugin_name + ":"}`,
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
