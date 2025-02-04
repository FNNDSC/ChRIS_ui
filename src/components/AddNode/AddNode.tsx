import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import { useCallback, useContext } from "react";
import { catchError } from "../../api/common";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/pluginSlice";
import type { ApplicationState } from "../../store/root/applicationState";
import { Alert } from "../Antd";
import {
  getParameterInput,
  sanitizeAdvancedConfig,
} from "../CreateFeed/createFeedHelper";
import BasicConfiguration from "./BasicConfiguration";
import GuidedConfig from "./GuidedConfig";
import "./add-node.css";
import type { PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { AddNodeContext } from "./context";
import { Types } from "./types";

const AddNode = ({
  addNodeLocally,
}: {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
}) => {
  const dispatch = useAppDispatch();
  const { childNode } = useAppSelector(
    (state: ApplicationState) => state.plugin.nodeOperations,
  );
  const { pluginInstances, selectedPlugin } = useAppSelector(
    (state) => state.instance,
  );
  const params = useAppSelector((state) => state.plugin.parameters);
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
    if (!plugin || !selectedPlugin || !pluginInstances) return;

    const { advancedConfigErrors, sanitizedInput } = sanitizeAdvancedConfig(
      advancedConfig,
      memoryLimit,
    );

    if (Object.keys(advancedConfigErrors).length > 0) {
      errorCallback(advancedConfigErrors);
      return;
    }

    try {
      const parameterInput = await getParameterInput(
        dropdownInput,
        requiredInput,
        plugin,
        selectedComputeEnv,
        sanitizedInput,
        selectedPlugin,
      );

      const client = ChrisAPIClient.getClient();
      const instance = await client.createPluginInstance(plugin.data.id, {
        previous_id: selectedPlugin.data.id,
        ...parameterInput,
      });

      if (instance) {
        addNodeLocally(instance);
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
    selectedComputeEnv,
    advancedConfig,
    memoryLimit,
    errorCallback,
    toggleOpen,
    nodeDispatch,
    addNodeLocally,
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
          footer={{ nextButtonText: "Add Node", isNextDisabled: isDisabled }}
        >
          <GuidedConfig />
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default AddNode;
