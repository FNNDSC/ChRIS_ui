import React, { useContext, useCallback, useEffect } from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Wizard, Button } from "@patternfly/react-core";
import { MdOutlineAddCircle } from "react-icons/md";
import GuidedConfig from "./GuidedConfig";
import BasicConfiguration from "./BasicConfiguration";
import { addNodeRequest } from "../../../store/pluginInstance/actions";
import { getNodeOperations, getParams } from "../../../store/plugin/actions";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { ApplicationState } from "../../../store/root/applicationState";
import { AddNodeProps } from "./types";
import { getRequiredObject } from "../CreateFeed/utils/createFeed";
import "./styles/AddNode.scss";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { AddNodeContext } from "./context";
import { Types } from "./types";

const AddNode: React.FC<AddNodeProps> = ({
  selectedPlugin,
  pluginInstances,
  addNode,
}: AddNodeProps) => {
  const dispatch = useDispatch();
  const { childNode } = useTypedSelector(
    (state) => state.plugin.nodeOperations
  );
  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);

  const {
    stepIdReached,
    pluginMeta,
    selectedPluginFromMeta: plugin,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
  } = state;

  const onBackStep = (newStep: {
    id?: string | number;
    name: React.ReactNode;
  }) => {
    const { id } = newStep;

    if (id) {
      const newStepId = stepIdReached > id ? (id as number) : stepIdReached;
      nodeDispatch({
        type: Types.SetStepIdReached,
        payload: {
          id: newStepId,
        },
      });
    }
  };

  const onNextStep = useCallback(
    (newStep: { id?: string | number; name: React.ReactNode }) => {
      const { id } = newStep;
      if (id) {
        const newStepId = stepIdReached < id ? (id as number) : stepIdReached;
        nodeDispatch({
          type: Types.SetStepIdReached,
          payload: {
            id: newStepId,
          },
        });
      }
    },
    [nodeDispatch, stepIdReached]
  );

  const basicConfiguration = selectedPlugin && (
    <BasicConfiguration selectedPlugin={selectedPlugin} />
  );
  const form = <GuidedConfig />;

  const steps = [
    {
      id: 1,
      name: "Plugin Selection",
      component: basicConfiguration,
      enableNext: !!pluginMeta,
      canJumpTo: stepIdReached > 1,
    },
    {
      id: 2,
      name: "Plugin Form",
      component: form,
      nextButtonText: "Add Node",
    },
  ];

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (pluginMeta) {
          onNextStep({
            id: 2,
            name: "Plugin Form",
          });
        }
      }
    });
  });

  const toggleOpen = React.useCallback(() => {
    nodeDispatch({
      type: Types.ResetState,
      payload: {},
    });

    dispatch(getNodeOperations("childNode"));
  }, [dispatch, nodeDispatch]);

  const handleSave = async () => {
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
        toggleOpen();
      }
    } catch (error: any) {
      toggleOpen();
    }
  };
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
          onNext={onNextStep}
          onBack={onBackStep}
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
