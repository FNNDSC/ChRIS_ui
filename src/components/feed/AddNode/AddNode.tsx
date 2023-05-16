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
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { AddNodeContext } from "./context";
import { Types } from "./types";
import { catchError } from "../../../api/common";
import "./styles/AddNode.scss";

const AddNode: React.FC<AddNodeProps> = ({
  selectedPlugin,
  pluginInstances,
  addNode,
  params,
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
    advancedConfig,
    memoryLimit,
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
  const isDisabled =
    params && Object.keys(requiredInput).length !== params["required"].length;

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
      enableNext: !isDisabled,
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

  const errorCallback = (error: any) => {
    nodeDispatch({
      type: Types.SetError,
      payload: {
        error,
      },
    });
  };

  const handleSave = async () => {
    if (!plugin || !selectedPlugin || !pluginInstances) {
      return;
    }

    const advancedConfigErrors: any = {};
    const sanitizedInput: any = {};

    for (const i in advancedConfig) {
      const inputValue = advancedConfig[i];
      //@ts-ignore
      if (isNaN(1 * inputValue)) {
        advancedConfigErrors[i] = "A valid integer is required";
      } else {
        if (i === "cpu_limit") {
          //@ts-ignore
          sanitizedInput[i] = `${inputValue * 1 * 1000}m`;
        }
        if (i === "memory_limit") {
          sanitizedInput[i] = `${inputValue}${memoryLimit}`;
        }
      }
    }

    if (Object.keys(advancedConfigErrors).length > 0) {
      errorCallback(advancedConfigErrors);
      return;
    }

    const { data: nodes } = pluginInstances;

    let parameterInput = await getRequiredObject(
      dropdownInput,
      requiredInput,
      plugin,
      errorCallback,
      selectedPlugin
    );

    parameterInput = {
      ...parameterInput,
      compute_resource_name: selectedComputeEnv,
      ...sanitizedInput,
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
      const errObj = catchError(error);

      nodeDispatch({
        type: Types.SetError,
        payload: {
          error: errObj,
        },
      });
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
