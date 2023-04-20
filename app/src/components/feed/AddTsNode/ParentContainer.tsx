import React from "react";
import { Title } from "@patternfly/react-core";
import { Plugin } from "@fnndsc/chrisapi";
import ChooseConfig from "./ChooseConfig";
import Footer from "./Footer";
import Split from "./Split";
import ConfigureJoin from "./ConfigureJoin";
import Review from "./Review";
import { getJoinInput } from "./utils";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import Client from "../../../api/chrisapiclient";

import "./GraphNode.scss";
import { switchTreeMode } from "../../../store/tsplugins/actions";
import {
  addNodeRequest,
  addSplitNodes,
} from "../../../store/pluginInstance/actions";

function getNodeState() {
  return {
    selectedConfig: "join-node",
    selectedTsPlugin: undefined,
    joinInput: {},
    splitInput: {},
    stepNumber: 0,
    error: {},
  };
}

export type InputType = {
  [key: string]: string | boolean;
};

export type NodeState = {
  selectedConfig: string;
  joinInput: InputType;
  splitInput: InputType;
  stepNumber: number;
  error: any;
};

export type GraphNodeProps = {
  onVisibleChange: (visible: boolean) => void;
  visible: boolean;
  selectedTsPlugin?: Plugin;
};

const GraphNode = (props: GraphNodeProps) => {
  const { onVisibleChange, visible, selectedTsPlugin } = props;
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const { tsNodes, treeMode } = useTypedSelector((state) => state.tsPlugins);
  const nodes = useTypedSelector((state) => state.instance.pluginInstances);
  const dispatch = useDispatch();

  const handleKeyDown = (event: any) => {
    if (event.code === "ArrowRight") {
      event.preventDefault();
      onNext();
    }
    if (event.code === "ArrowLeft") {
      event.preventDefault();
      onBack();
    }
    if (event.key === "Enter") {
      if (stepNumber === 2) {
        handleAdd();
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const [nodeState, setNodeState] = React.useState<NodeState>(getNodeState);
  const { selectedConfig, joinInput, splitInput, stepNumber } = nodeState;

  const handleConfig = (value: string) => {
    setNodeState({
      ...nodeState,
      selectedConfig: value,
    });
  };

  const onBack = () => {
    stepNumber > 0 &&
      setNodeState({
        ...nodeState,
        stepNumber: stepNumber - 1,
      });
  };

  const onNext = () => {
    if (stepNumber === 2) {
      handleAdd();
    } else
      stepNumber < 2 &&
        setNodeState({
          ...nodeState,
          stepNumber: stepNumber + 1,
        });
  };

  const onCancel = () => {
    handleResets();
    onVisibleChange(!visible);
    dispatch(switchTreeMode(!treeMode));
  };

  const handleResets = () => {
    setNodeState(getNodeState);
  };

  const handleAdd = async () => {
    const { joinInput, selectedConfig } = nodeState;
    const input = getJoinInput(joinInput, tsNodes);

    if (tsNodes && tsNodes?.length > 0) {
      if (selectedConfig === "join-node") {
        const finalParameterList = {
          ...input,
          ["previous_id"]: tsNodes[0].data.id,
        };

        const pluginInstance = await selectedTsPlugin?.getPluginInstances();
        try {
          await pluginInstance?.post(finalParameterList);
          const pluginInstanceItems = pluginInstance?.getItems();
          if (pluginInstanceItems) {
            const node = pluginInstanceItems[0];
            dispatch(addNodeRequest({ pluginItem: node, nodes: nodes.data }));
          }
          dispatch(switchTreeMode(!treeMode));
          handleResets();
          onVisibleChange(!visible);
        } catch (error) {
          console.warn("ERROR", error);
        }
      } else if (
        selectedPlugin &&
        splitInput &&
        splitInput["filter"] &&
        splitInput["compute_resource"]
      ) {
        try {
          const client = Client.getClient();
          const node = await client.createPluginInstanceSplit(
            selectedPlugin.data.id,
            splitInput["filter"] as string,
            splitInput["compute_resource"] as string
          );
          const instanceIds = node.data.created_plugin_inst_ids.split(",");
          const splitNodes = [];
          for (const i in instanceIds) {
            const id = instanceIds[i];
            const pluginInstance = await client.getPluginInstance(+id);
            splitNodes.push(pluginInstance);
          }
          dispatch(
            addSplitNodes({ splitNodes, nodes: nodes.data, selectedPlugin })
          );
          handleResets();
          onVisibleChange(!visible);
        } catch (error) {
          console.warn("ERROR", error);
        }
      }
    }
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
          <ConfigureJoin
            handleValueChange={handleValueChange}
            handleCheckboxChange={handleCheckboxChange}
            selectedTsPlugin={selectedTsPlugin}
            joinInput={joinInput}
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
      component: <Review nodeState={nodeState} />,
    },
  ];

  const title = [
    "Configure a Graph Node :",
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
        splitInput={splitInput}
      />
    </>
  );
};

export default GraphNode;
