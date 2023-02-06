import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Wizard, Spinner, Button } from "@patternfly/react-core";
import { MdOutlineAddCircle } from "react-icons/md";
import GuidedConfig from "./GuidedConfig";
import BasicConfiguration from "./BasicConfiguration";
import { addNodeRequest } from "../../../store/pluginInstance/actions";
import { getNodeOperations, getParams } from "../../../store/plugin/actions";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { ApplicationState } from "../../../store/root/applicationState";
import { AddNodeState, AddNodeProps, InputType, InputIndex } from "./types";
import { getRequiredObject } from "../CreateFeed/utils/createFeed";
import "./styles/AddNode.scss";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";

function getInitialState() {
  return {
    stepIdReached: 1,
    nodes: [],
    data: {},
    requiredInput: {},
    dropdownInput: {},
    selectedComputeEnv: "",
    editorValue: "",
    loading: false,
    errors: {},
  };
}

const AddNode: React.FC<AddNodeProps> = ({
  selectedPlugin,
  pluginInstances,
  getParams,
  addNode,
}: AddNodeProps) => {
  const dispatch = useDispatch();
  const [addNodeState, setNodeState] =
    React.useState<AddNodeState>(getInitialState);
  const {
    stepIdReached,
    nodes,
    data,
    requiredInput,
    dropdownInput,
    selectedComputeEnv,
  } = addNodeState;
  const { childNode } = useTypedSelector(
    (state) => state.plugin.nodeOperations
  );

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
      });
    } else {
      setNodeState({
        ...addNodeState,
        dropdownInput: {
          ...addNodeState.dropdownInput,
          [id]: input,
        },
      });
    }
  };

  const resetState = React.useCallback(() => {
    if (childNode === true) {
      setNodeState(getInitialState());
    }
    dispatch(getNodeOperations("childNode"));
  }, [childNode, dispatch]);

  const toggleOpen = React.useCallback(() => {
    resetState();
  }, [resetState]);

  const onNext = (newStep: { id?: string | number; name: React.ReactNode }) => {
    const { stepIdReached } = addNodeState;
    const { id } = newStep;

    id &&
      setNodeState({
        ...addNodeState,
        stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
      });
  };

  const onBack = (newStep: { id?: string | number; name: React.ReactNode }) => {
    const { id } = newStep;

    if (id === 1) {
      setNodeState({
        ...addNodeState,
        dropdownInput: {},
        requiredInput: {},
        stepIdReached: stepIdReached > id ? (id as number) : stepIdReached,
      });
    } else {
      id &&
        setNodeState({
          ...addNodeState,
          stepIdReached: stepIdReached > id ? (id as number) : stepIdReached,
        });
    }
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

  const handleSave = async () => {
    const { dropdownInput, requiredInput, selectedComputeEnv } = addNodeState;
    const { plugin } = addNodeState.data;

    if (!plugin || !selectedPlugin || !pluginInstances) {
      return;
    }
    setNodeState({
      ...addNodeState,
      loading: true,
    });
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
        loading: false,
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

  const pluginName = data.plugin?.data.name;

  // const pluginVersion = (pluginName);

  const form = data.plugin ? (
    <GuidedConfig
      pluginName={pluginName}
      defaultValueDisplay={false}
      renderComputeEnv={true}
      inputChange={inputChange}
      deleteInput={deleteInput}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      selectedComputeEnv={selectedComputeEnv}
      setComputeEnviroment={setComputeEnv}
      handlePluginSelect={handlePluginSelect}
      plugin={data.plugin}
      errors={addNodeState.errors}
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
      nextButtonText: "Add Node",
    },
  ];

  return (
    <React.Fragment>
      <Button icon={<MdOutlineAddCircle />} type="button" onClick={toggleOpen}>
        Add a Child Node{" "}
        <span style={{ padding: "2px", color: "#F5F5DC", fontSize: "11px" }}>
          ( C )
        </span>
      </Button>
      {childNode && (
        <Wizard
          isOpen={childNode}
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
