import type { PluginInstance } from "@fnndsc/chrisapi";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import React, { Fragment, useCallback, useContext } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/pluginSlice";
import { Alert, Form, Tag } from "../Antd";
import { SpinContainer } from "../Common";
import Pipelines from "../PipelinesCopy";
import { PipelineContext, Types } from "../PipelinesCopy/context";

const AddPipeline = ({
  addNodeLocally,
}: {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
}) => {
  const { state, dispatch } = useContext(PipelineContext);
  const { pipelineToAdd, selectedPipeline, computeInfo, titleInfo } = state;
  const reactDispatch = useAppDispatch();
  const { childPipeline } = useAppSelector(
    (state) => state.plugin.nodeOperations,
  );

  const { pluginInstances, selectedPlugin } = useAppSelector(
    (state) => state.instance,
  );

  const alreadyAvailableInstances = pluginInstances.data;

  const handleToggle = useCallback(() => {
    if (childPipeline) {
      dispatch({
        type: Types.ResetState,
      });
      mutation.reset();
    }
    reactDispatch(getNodeOperations("childPipeline"));
  }, [childPipeline, dispatch, reactDispatch]);

  const addPipeline = async () => {
    const id = pipelineToAdd?.data.id;
    const resources = selectedPipeline?.[id];

    if (selectedPlugin && resources) {
      const { parameters } = resources;
      const client = ChrisAPIClient.getClient();

      try {
        const nodes_info = client.computeWorkflowNodesInfo(parameters.data);
        for (const node of nodes_info) {
          const activeNode = computeInfo?.[id][node.piping_id];
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

        const fn = workflow.getPluginInstances;
        const boundFn = fn.bind(workflow);
        const params = { limit: 100, offset: 0 };
        const { resource: instanceItems } = await fetchResource<PluginInstance>(
          params,
          boundFn,
        );
        if (instanceItems && alreadyAvailableInstances) {
          addNodeLocally(instanceItems.reverse());
        }
      } catch (e: any) {
        if (e instanceof Error) throw new Error(e.message);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: () => addPipeline(),
  });

  React.useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        handleToggle();
      }, 1000);
    }
  }, [mutation.isSuccess, handleToggle]);

  React.useEffect(() => {
    const el = document.querySelector("#indicators");

    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  const isButtonDisabled = !(
    pipelineToAdd &&
    computeInfo?.[pipelineToAdd.data.id] &&
    !mutation.isPending
  );

  return (
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
        <Fragment key="status">
          {state.pipelineToAdd && (
            <div>
              <Form.Item
                style={{ marginBottom: "0" }}
                label="Currently Selected Pipeline"
              >
                <Tag
                  bordered
                  color="#004080"
                  closeIcon
                  onClose={(e) => {
                    e.preventDefault();
                    dispatch({
                      type: Types.PipelineToDelete,
                    });
                  }}
                >
                  {state.pipelineToAdd.data.name}
                </Tag>
              </Form.Item>
            </div>
          )}
        </Fragment>,
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
  );
};

export default AddPipeline;
