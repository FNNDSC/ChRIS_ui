import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Wizard, Spinner, Button } from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";
import Review from "./Review";
import BasicConfiguration from "./BasicConfiguration";
import { addNodeRequest } from "../../../store/pluginInstance/actions";
import { getParams } from "../../../store/plugin/actions";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { ApplicationState } from "../../../store/root/applicationState";
import { AddNodeState, AddNodeProps, InputType, InputIndex } from "./types";
import { handleGetTokens } from "./lib/utils";
import { getRequiredObject } from "../CreateFeed/utils/createFeed";
import "./styles/AddNode.scss";

function getInitialState() {
  return {
    isOpen: false,
    stepIdReached: 1,
    nodes: [],
    data: {},
    requiredInput: {},
    dropdownInput: {},
    selectedComputeEnv: "",
    errors: {},
    editorValue: "",
  };
}

const AddNode: React.FC<AddNodeProps> = ({
  selectedPlugin,
  pluginInstances,
  getParams,
  addNode,
  params,
}: AddNodeProps) => {
  const [addNodeState, setNodeState] =
    React.useState<AddNodeState>(getInitialState);
  const {
    isOpen,
    stepIdReached,
    nodes,
    data,
    requiredInput,
    dropdownInput,
    selectedComputeEnv,
    errors,
    editorValue,
  } = addNodeState;

  const handleFetchedData = React.useCallback(() => {
    if (pluginInstances) {
      const { data: nodes } = pluginInstances;
      setNodeState((addNodeState) => {
        return {
          ...addNodeState,
          nodes,
          data: {
            ...addNodeState.data,
            parent: selectedPlugin,
          },
        };
      });
    }
  }, [pluginInstances, selectedPlugin]);

  React.useEffect(() => {
    handleFetchedData();
  }, [handleFetchedData]);

  const inputChange = (
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean
  ) => {
    const input: InputIndex = {};
    input["value"] = value;
    input["flag"] = flag;
    input["type"] = type;
    input["placeholder"] = placeholder;

    if (required === true) {
      setNodeState({
        ...addNodeState,
        requiredInput: {
          ...addNodeState.requiredInput,
          [id]: input,
        },
        errors: {},
      });
    } else {
      setNodeState({
        ...addNodeState,
        dropdownInput: {
          ...addNodeState.dropdownInput,
          [id]: input,
        },
        errors: {},
      });
    }
  };

  const toggleOpen = () => {
    resetState();
  };

  const onNext = (newStep: { id?: string | number; name: React.ReactNode }) => {
    const { stepIdReached } = addNodeState;
    const { id, name } = newStep;
    const { optional, nonOptional } = handleGetTokens(editorValue, params);

    id && id === 4 && name === "Review" && editorValue
      ? setNodeState({
          ...addNodeState,
          dropdownInput: optional,
          requiredInput: nonOptional,
          stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
        })
      : id &&
        setNodeState({
          ...addNodeState,
          stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
        });
  };

  const onBack = (newStep: { id?: string | number; name: React.ReactNode }) => {
    const { id, name } = newStep;
    const { optional, nonOptional } = handleGetTokens(editorValue, params);

    id && id === 1
      ? setNodeState({
          ...addNodeState,
          dropdownInput: {},
          requiredInput: {},
          stepIdReached: stepIdReached > id ? (id as number) : stepIdReached,
        })
      : id === 2 && name === "Plugin Configuration-Form" && editorValue
      ? setNodeState({
          ...addNodeState,
          dropdownInput: optional,
          requiredInput: nonOptional,
          stepIdReached: stepIdReached > id ? (id as number) : stepIdReached,
          editorValue: "",
        })
      : id &&
        setNodeState({
          ...addNodeState,
          stepIdReached: stepIdReached > id ? (id as number) : stepIdReached,
        });
  };

  const handlePluginSelect = (plugin: Plugin) => {
    setNodeState((prevState) => ({
      ...prevState,
      data: { ...prevState.data, plugin },
    }));
    getParams(plugin);
  };

  const setComputeEnv = React.useCallback((computeEnv: string) => {
    setNodeState((addNodeState) => {
      return {
        ...addNodeState,
        selectedComputeEnv: computeEnv,
      };
    });
  }, []);

  const setEditorValue = (value: string) => {
    setNodeState({
      ...addNodeState,
      editorValue: value,
    });
  };

  const deleteInput = (input: string) => {
    const { dropdownInput } = addNodeState;

    const newObject = Object.entries(dropdownInput)
      .filter(([key]) => {
        return key !== input;
      })
      .reduce((acc: InputType, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    setNodeState({
      ...addNodeState,
      dropdownInput: newObject,
    });
  };

  const resetState = () => {
    if (isOpen === true) {
      setNodeState(getInitialState());
    } else {
      setNodeState({
        ...addNodeState,
        isOpen: !isOpen,
      });
    }
  };

  const handleSave = async () => {
    const { dropdownInput, requiredInput, selectedComputeEnv } = addNodeState;
    const { plugin } = addNodeState.data;

    if (!plugin || !selectedPlugin || !pluginInstances) {
      return;
    }
    const { data: nodes } = pluginInstances;

    let parameterInput = await getRequiredObject(
      dropdownInput,
      requiredInput,
      plugin,
      selectedPlugin
    );

    parameterInput = {
      ...parameterInput,
      compute_resource_name: selectedComputeEnv,
    };

    const pluginInstance = await plugin.getPluginInstances();

    try {
      await pluginInstance.post(parameterInput);
      const nodeList = pluginInstance.getItems();
      if (nodeList) {
        addNode({
          pluginItem: nodeList[0],
          nodes,
        });
        resetState();
      }
    } catch (error: any) {
      setNodeState({
        ...addNodeState,
        errors: error.response.data,
      });
    }
  };

  const basicConfiguration = selectedPlugin && nodes && (
    <BasicConfiguration
      selectedPlugin={addNodeState.data.plugin}
      parent={selectedPlugin}
      nodes={nodes}
      handlePluginSelect={handlePluginSelect}
    />
  );
  const form = data.plugin ? (
    <GuidedConfig
      inputChange={inputChange}
      deleteInput={deleteInput}
      plugin={data.plugin}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      selectedComputeEnv={selectedComputeEnv}
      setComputeEnviroment={setComputeEnv}
    />
  ) : (
    <Spinner size="xl" />
  );

  const editor = data.plugin ? (
    <Editor
      plugin={data.plugin}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      setEditorValue={setEditorValue}
    />
  ) : (
    <Spinner size="xl" />
  );

  const review = data.plugin ? (
    <Review
      parent={selectedPlugin}
      currentPlugin={data.plugin}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      computeEnvironment={selectedComputeEnv}
      errors={errors}
    />
  ) : (
    <Spinner size="xl" />
  );

  const steps = [
    {
      id: 1,
      name: "Plugin Selection",
      component: basicConfiguration,
      enableNext: !!data.plugin,
      canJumpTo: stepIdReached > 1,
    },
    {
      id: 2,
      name: "Plugin Configuration-Form",
      component: form,
      canJumpTo: stepIdReached > 2,
    },
    {
      id: 3,
      name: "Plugin Configuration-Editor",
      component: editor,
      canJumpTo: stepIdReached > 3,
    },
    {
      id: 4,
      name: "Review",
      component: review,
      nextButtonText: "Add Node",
      canJumpTo: stepIdReached > 4,
    },
  ];

  return (
    <React.Fragment>
      <Button icon={<PlusCircleIcon />} type="button" onClick={toggleOpen}>
        Add a Child Node
      </Button>
      {isOpen && (
        <Wizard
          isOpen={isOpen}
          onClose={toggleOpen}
          title="Add a New Node"
          description="This wizard allows you to add a node to a feed"
          onSave={handleSave}
          steps={steps}
          onNext={onNext}
          onBack={onBack}
        />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.instance.selectedPlugin,
  pluginInstances: state.instance.pluginInstances,
  params: state.plugin.parameters,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getParams: (plugin: Plugin) => dispatch(getParams(plugin)),
  addNode: (item: { pluginItem: PluginInstance; nodes?: PluginInstance[] }) =>
    dispatch(addNodeRequest(item)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);
