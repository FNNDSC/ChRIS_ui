import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { PlusButtonIcon } from "../../icons";
import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/actions";
import {
  getPluginInstancesSuccess,
  getSelectedPlugin,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import { SpinContainer } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineContext, Types } from "../PipelinesCopy/context";

const AddPipeline = () => {
  const { state, dispatch } = useContext(PipelineContext);
  const { pipelineToAdd, selectedPipeline, computeInfo, titleInfo } = state;
  const reactDispatch = useDispatch();
  const { childPipeline } = useTypedSelector(
    (state) => state.plugin.nodeOperations,
  );

  const alreadyAvailableInstances = useTypedSelector(
    (state) => state.instance.pluginInstances.data,
  );

  const handleToggle = () => {
    if (childPipeline) {
      dispatch({
        type: Types.ResetState,
      });
      mutation.reset();
    }
    reactDispatch(getNodeOperations("childPipeline"));
  };

  const feed = useTypedSelector((state) => state.feed.currentFeed.data);
  const { selectedPlugin } = useTypedSelector((state) => state.instance);

  const addPipeline = async () => {
    const id = pipelineToAdd?.data.id;
    const resources = selectedPipeline?.[id];

    if (selectedPlugin && feed && resources) {
      const { parameters } = resources;
      const client = ChrisAPIClient.getClient();

      try {
        const nodes_info = client.computeWorkflowNodesInfo(parameters.data);

        for (const node of nodes_info) {
          // Set compute info
          const activeNode = computeInfo?.[id][node.piping_id];
          // Set Title
          const titleSet = titleInfo?.[id][node.piping_id];

          if (activeNode) {
            const compute_node = activeNode.currentlySelected;
            node.compute_resource_name = compute_node;
          }

          if (titleSet) {
            node.title = titleSet;
          }
        }

        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin.data.id,
          nodes_info: JSON.stringify(nodes_info),
        });

        const pluginInstances = await workflow.getPluginInstances({
          limit: 1000,
        });
        const instanceItems = pluginInstances.getItems();
        if (instanceItems && alreadyAvailableInstances) {
          const firstInstance = instanceItems[instanceItems.length - 1];
          const completeList = [...alreadyAvailableInstances, ...instanceItems];
          reactDispatch(getSelectedPlugin(firstInstance));
          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };
          reactDispatch(getPluginInstancesSuccess(pluginInstanceObj));
          reactDispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (e: any) {
        throw new Error(e.message ? e.message : e);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: () => addPipeline(),
  });

  React.useEffect(() => {
    const el = document.querySelector("#indicators");

    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  const isButtonDisabled =
    pipelineToAdd && computeInfo?.[pipelineToAdd.data.id] && !mutation.isPending
      ? false
      : true;

  return (
    <React.Fragment>
      <Button icon={<PlusButtonIcon />} onClick={handleToggle} type="button">
        Add a Pipeline <span style={{ padding: "2px" }}>( P )</span>
      </Button>
      <Modal
        variant={ModalVariant.large}
        aria-label="My Pipeline Modal"
        isOpen={childPipeline}
        onClose={handleToggle}
        description="Add a Pipeline to the plugin instance"
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => mutation.mutate()}
            isDisabled={isButtonDisabled}
          >
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleToggle}>
            Cancel
          </Button>,
        ]}
      >
        <Pipelines />

        {mutation.isError || mutation.isSuccess || mutation.isPending ? (
          <div id="indicators">
            {mutation.isError && (
              <Alert type="error" description={mutation.error.message} />
            )}
            {mutation.isSuccess && (
              <Alert type="success" description="Pipeline Added" />
            )}
            {mutation.isPending && <SpinContainer title="Adding Pipeline..." />}
          </div>
        ) : null}
      </Modal>
    </React.Fragment>
  );
};

export default AddPipeline;
