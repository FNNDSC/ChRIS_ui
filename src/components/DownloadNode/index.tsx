import { Button } from "@patternfly/react-core";
import FaDownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchComputeInfo, fetchResources } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import {
  getPluginInstancesSuccess,
  getSelectedPlugin,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import { SpinContainer } from "../Common";
import { PerPipelinePayload } from "../PipelinesCopy/context";

function DownloadNode() {
  const { pluginInstances, selectedPlugin } = useTypedSelector(
    (state) => state.instance,
  );
  const reactDispatch = useDispatch();

  const alreadyAvailableInstances = pluginInstances.data;

  async function fetchPipelines() {
    const client = ChrisAPIClient.getClient();

    try {
      const pipelineList = await client.getPipelines({
        name: "zip v20240311",
      });

      const pipelines = pipelineList.getItems();

      if (pipelines && pipelines.length > 0) {
        const pipeline = pipelines[0];
        const { id } = pipeline.data;

        const data: PerPipelinePayload = await fetchResources(pipeline);
        const { parameters, pluginPipings } = data;

        const nodes_info = client.computeWorkflowNodesInfo(parameters.data);

        // This is an assumption as I know the zip file will only have on pluginPiping
        const piping = pluginPipings[0];
        const computeEnvPayload = await fetchComputeInfo(
          piping.data.plugin_id,
          `${piping.data.id}`,
        );

        for (const node of nodes_info) {
          const activeNode = computeEnvPayload?.[node.piping_id];

          if (activeNode) {
            const compute_node = activeNode.currentlySelected;
            node.compute_resource_name = compute_node;
          }
        }

        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin?.data.id, // Ensure selectedPlugin is defined
          nodes_info: JSON.stringify(nodes_info),
        });

        const pluginInstances = await workflow.getPluginInstances({
          limit: 1000,
        });

        const instanceItems = pluginInstances.getItems();

        if (
          instanceItems &&
          instanceItems.length > 0 &&
          alreadyAvailableInstances
        ) {
          const firstInstance = instanceItems[instanceItems.length - 1];
          const completeList = [...alreadyAvailableInstances, ...instanceItems];

          // Assuming reactDispatch, getSelectedPlugin, getPluginInstanceStatusSuccess, and getPluginInstanceStatusRequest are defined elsewhere
          reactDispatch(getSelectedPlugin(firstInstance));

          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };

          reactDispatch(getPluginInstancesSuccess(pluginInstanceObj));
          reactDispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }
      } else {
        throw new Error(
          "The pipeline to zip is not registered. Please contact an admin",
        );
      }
      return pipelines;
    } catch (error) {
      throw error;
    }
  }

  const mutation = useMutation({
    mutationFn: () => fetchPipelines(),
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        mutation.reset();
      }, 1000);
    }
  }, [mutation.isSuccess]);

  return (
    <>
      <Button
        onClick={() => {
          mutation.mutate();
        }}
        icon={<FaDownloadIcon />}
      >
        Zip
      </Button>
      {mutation.isError || mutation.isSuccess || mutation.isPending ? (
        <div
          style={{
            marginTop: "1rem",
          }}
        >
          {mutation.isError && (
            <Alert type="error" description={mutation.error.message} />
          )}
          {mutation.isSuccess && (
            <Alert type="success" description="Zipping process started..." />
          )}
          {mutation.isPending && (
            <SpinContainer title="Preparing to initiate the zipping process..." />
          )}
        </div>
      ) : null}
    </>
  );
}

export default DownloadNode;
