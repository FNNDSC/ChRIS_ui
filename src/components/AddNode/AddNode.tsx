import React, { useContext, useEffect } from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";

import {
  Wizard,
  Button,
  ModalVariant,
  Modal,
  WizardHeader,
  WizardStep,
  useWizardContext,
} from "@patternfly/react-core";
import { PlusButtonIcon } from "../../icons";
import GuidedConfig from "./GuidedConfig";
import BasicConfiguration from "./BasicConfiguration";
import { addNodeRequest } from "../../store/pluginInstance/actions";
import { getNodeOperations, getParams } from "../../store/plugin/actions";
import { getRequiredObject } from "../CreateFeed/createFeed";
import { useTypedSelector } from "../../store/hooks";
import { useDispatch } from "react-redux";
import { AddNodeContext } from "./context";
import { Types } from "./types";
import type { AddNodeProps } from "./types";
import type { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import type { ApplicationState } from "../../store/root/applicationState";
import { catchError } from "../../api/common";
import "./add-node.css";

const AddNode = ({
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
      console.log("ErrorObj", errObj)

      nodeDispatch({
        type: Types.SetError,
        payload: {
          error: errObj,
        },
      });
    }
  };

  return (
    <>
      <Button icon={<PlusButtonIcon />} type="button" onClick={toggleOpen}>
        Add a Child Node <span style={{ padding: "2px" }}>( C )</span>
      </Button>
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
    </>
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
