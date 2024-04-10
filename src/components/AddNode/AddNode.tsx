import type { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import {
  Button,
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
  useWizardContext,
} from "@patternfly/react-core";
import React, { useContext, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { catchError } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations, getParams } from "../../store/plugin/actions";
import { addNodeRequest } from "../../store/pluginInstance/actions";
import type { ApplicationState } from "../../store/root/applicationState";
import { getRequiredObject } from "../CreateFeed/createFeedHelper";
import BasicConfiguration from "./BasicConfiguration";
import GuidedConfig from "./GuidedConfig";
import "./add-node.css";
import { AddNodeContext } from "./context";
import type { AddNodeProps } from "./types";
import { Types } from "./types";

const AddNode = ({
  selectedPlugin,
  pluginInstances,
  addNode,
  params,
}: AddNodeProps) => {
  const dispatch = useDispatch();

  const { childNode } = useTypedSelector(
    (state) => state.plugin.nodeOperations,
  );
  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);

  const {
    pluginMeta,
    selectedPluginFromMeta: plugin,
    dropdownInput,
    requiredInput,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
  } = state;

  const { goToNextStep: onNextStep } = useWizardContext();

  const isDisabled =
    params && Object.keys(requiredInput).length !== params["required"].length;

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (pluginMeta) {
          onNextStep();
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
      if (Number.isNaN(1 * inputValue)) {
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
      selectedPlugin,
    );

    parameterInput = {
      ...parameterInput,
      compute_resource_name: selectedComputeEnv,
      ...sanitizedInput,
    };

    try {
      const pluginInstance = await plugin.getPluginInstances();
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
    <Modal
      aria-label="Wizard Modal"
      showClose={true}
      hasNoBodyWrapper
      variant={ModalVariant.large}
      isOpen={childNode}
    >
      <Wizard
        header={
          <WizardHeader
            onClose={toggleOpen}
            title="Add a New Node"
            description="This wizard allows you to add a node to a feed"
          />
        }
        onClose={toggleOpen}
        onSave={handleSave}
        height={500}
        width={"100%"}
      >
        <WizardStep
          id={"1"}
          name="Plugin Selection"
          footer={{
            isNextDisabled: pluginMeta ? false : true,
          }}
        >
          {selectedPlugin ? (
            <BasicConfiguration selectedPlugin={selectedPlugin} />
          ) : (
            <span>No Plugin Selected</span>
          )}
        </WizardStep>
        <WizardStep
          id={"2"}
          name="Plugin Form"
          footer={{
            nextButtonText: "Add Node",
            isNextDisabled: !isDisabled ? false : true,
          }}
        >
          <GuidedConfig />
        </WizardStep>
      </Wizard>
    </Modal>
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

const AddNodeConnect = connect(mapStateToProps, mapDispatchToProps)(AddNode);

export default AddNodeConnect;
