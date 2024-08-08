import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import type React from "react";
import { useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { catchError } from "../../api/common";
import { getNodeOperations } from "../../store/plugin/actions";
import { addNodeRequest } from "../../store/pluginInstance/actions";
import type { ApplicationState } from "../../store/root/applicationState";
import { getRequiredObject } from "../CreateFeed/createFeedHelper";
import BasicConfiguration from "./BasicConfiguration";
import GuidedConfig from "./GuidedConfig";
import "./add-node.css";
import { Alert } from "antd";
import { AddNodeContext } from "./context";
import { Types } from "./types";
import { useTypedSelector } from "../../store/hooks";

const AddNode: React.FC = () => {
  const dispatch = useDispatch();
  const { childNode } = useSelector(
    (state: ApplicationState) => state.plugin.nodeOperations,
  );
  const { pluginInstances, selectedPlugin } = useTypedSelector(
    (state) => state.instance,
  );
  const params = useTypedSelector((state) => state.plugin.parameters);

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

  const isDisabled =
    params && Object.keys(requiredInput).length !== params.required.length;

  const toggleOpen = useCallback(() => {
    nodeDispatch({ type: Types.ResetState, payload: {} });
    dispatch(getNodeOperations("childNode"));
  }, [dispatch, nodeDispatch]);

  const errorCallback = useCallback(
    (error: any) => {
      nodeDispatch({ type: Types.SetError, payload: { error } });
    },
    [nodeDispatch],
  );

  const handleSave = useCallback(async () => {
    if (!plugin || !selectedPlugin || !pluginInstances) {
      return;
    }

    const advancedConfigErrors: Record<string, string> = {};
    const sanitizedInput: Record<string, string> = {};

    for (const key in advancedConfig) {
      const inputValue = +advancedConfig[key];

      if (Number.isNaN(inputValue)) {
        advancedConfigErrors[key] = "A valid integer is required";
      } else {
        if (key === "cpu_limit") {
          sanitizedInput[key] = `${inputValue * 1000}m`;
        }
        if (key === "memory_limit") {
          sanitizedInput[key] = `${inputValue}${memoryLimit}`;
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
        dispatch(addNodeRequest({ pluginItem: nodeList[0], nodes }));
        toggleOpen();
      }
    } catch (error: any) {
      const errObj = catchError(error);
      nodeDispatch({ type: Types.SetError, payload: { error: errObj } });
    }
  }, [
    plugin,
    selectedPlugin,
    pluginInstances,
    dropdownInput,
    requiredInput,
    plugin,
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
    errorCallback,
    toggleOpen,
    dispatch,
    nodeDispatch,
  ]);

  return (
    <Modal
      aria-label="Wizard Modal"
      showClose
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
        width="100%"
      >
        <WizardStep
          id="1"
          name="Plugin Selection"
          footer={{ isNextDisabled: !pluginMeta }}
        >
          {selectedPlugin ? (
            <BasicConfiguration selectedPlugin={selectedPlugin} />
          ) : (
            <Alert
              type="error"
              description="Please select a plugin to add this node to"
            />
          )}
        </WizardStep>
        <WizardStep
          id="2"
          name="Plugin Form"
          footer={{ nextButtonText: "Add Node", isNextDisabled: !!isDisabled }}
        >
          <GuidedConfig />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default AddNode;
