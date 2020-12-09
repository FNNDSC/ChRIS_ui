import React from "react";
import { Dispatch } from "redux";
import { Wizard } from "@patternfly/react-core";
import { connect } from "react-redux";

import { ApplicationState } from "../../../store/root/applicationState";
import "./styles/addnode.scss";
import LoadingSpinner from "../../common/loading/LoadingSpinner";
import Review from "./Review";
import { addNodeRequest } from "../../../store/feed/actions";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { InfrastructureIcon } from "@patternfly/react-icons";
import { getParams } from "../../../store/plugin/actions";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";
import BasicConfiguration from "./BasicConfiguration";
import { AddNodeState, AddNodeProps, InputType, InputIndex } from "./types";
import { getRequiredObject } from "../CreateFeed/utils/createFeed";

function getInitialState(){
  return {
    isOpen: false,
    stepIdReached: 1,
    nodes: [],
    data: {},
    requiredInput: {},
    dropdownInput: {},
    selectedComputeEnv: "",
    errors: {},
  };
}


const AddNode:React.FC<AddNodeProps>=({
  selectedPlugin,
  pluginInstances,
  getParams,
  addNode,
  loadingAddNode
})=>{
const [addNodeState,setNodeState]= React.useState<AddNodeState>(getInitialState)
const {isOpen,stepIdReached,nodes,data,requiredInput,dropdownInput,selectedComputeEnv,errors}=addNodeState

React.useEffect(()=>{
  handleFetchedData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
},[])

const handleFetchedData=()=>{
if(pluginInstances){
const { data: nodes } = pluginInstances;
setNodeState({
  ...addNodeState,
  nodes,
  data:{
    ...addNodeState.data,
    parent:selectedPlugin
  }
})
 }
}

const inputChange=(
    id: string,
    paramName: string,
    value: string,
    required: boolean,
    type: string,
    placeholder: string
  ) =>{
    const input: InputIndex = {};
    input["id"] = id;
    input[paramName] = value;
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
  }

  const inputChangeFromEditor=(dropdownInput: InputType, requiredInput: InputType)=> {
    setNodeState((prevState) => ({
      ...prevState,
      dropdownInput: dropdownInput,
      errors: {},
    }));

    setNodeState((prevState) => ({
      ...prevState,
      requiredInput: requiredInput,
      errors: {},
    }));
  }

  const toggleOpen=()=> {
    setNodeState((state: AddNodeState) => ({
      ...state,  
      isOpen: !state.isOpen,
      })
  )
     
  }

  const onNext=(newStep: { id?: string | number; name: React.ReactNode })=> {
    const { stepIdReached } = addNodeState;
    const { id } = newStep;
    id &&
      setNodeState({
        ...addNodeState,
        stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
      });
  }

  const onBack=(newStep: { id?: string | number; name: React.ReactNode })=>{
    const { id } = newStep;
    if (id === 1) {
      setNodeState({
        ...addNodeState,
        dropdownInput: {},
        requiredInput: {},
      });
    }
  }

 const handlePluginSelect=(plugin: Plugin)=>{
    setNodeState((prevState) => ({
      ...prevState,
      data: { ...prevState.data, plugin },
    }));
    getParams(plugin);
  }

const setComputeEnv=(computeEnv: string)=>{
    setNodeState({
      ...addNodeState,
      selectedComputeEnv: computeEnv,
    });
  }


const deleteInput=(input: string)=>{
    const { dropdownInput } = addNodeState;

    let newObject = Object.entries(dropdownInput)
      .filter(([key, value]) => {
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
  }

const resetState=()=>{
    setNodeState({
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      dropdownInput: {},
      requiredInput: {},
      errors: {},
      selectedComputeEnv: "",
    });
  }

const handleSave=async()=>{
    const { dropdownInput, requiredInput, selectedComputeEnv, } = addNodeState;
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
      const node = pluginInstance.getItems()[0];
      addNode({
        pluginItem: node,
        nodes,
      });
      resetState();
    } catch (error) {
      setNodeState({
        ...addNodeState,
        errors: error.response.data,
      });
    }
  }

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
    <LoadingSpinner />
  );

  const editor = data.plugin ? (
    <Editor
      plugin={data.plugin}
      inputChange={inputChange}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      inputChangeFromEditor={inputChangeFromEditor}
    />
  ) : (
    <LoadingSpinner />
  );

  const review = data.plugin ? (
    <Review
      data={data}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      computeEnvironment={selectedComputeEnv}
      errors={errors}
    />
  ) : (
    <LoadingSpinner />
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
      <Button
        style={{
          marginTop: "20px",
        }}
        variant="primary"
        onClick={toggleOpen}
      >
        <InfrastructureIcon style={{ marginRight: "4px" }} />
        {loadingAddNode
          ? "Adding a Node"
          : Object.keys(errors).length > 0
          ? "Please try again"
          : "Add a Node"}
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

}


const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.feed.selectedPlugin,
  pluginInstances: state.feed.pluginInstances,
  loadingAddNode:state.feed.loadingAddNode
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getParams: (plugin: Plugin) => dispatch(getParams(plugin)),
  addNode: (item: { pluginItem: PluginInstance; nodes?: PluginInstance[] }) =>
    dispatch(addNodeRequest(item)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);



