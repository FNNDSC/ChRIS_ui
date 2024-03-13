import { Button } from "@patternfly/react-core";
import FaDownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import {
  getPluginInstancesSuccess,
  getSelectedPlugin,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import { SpinContainer } from "../Common";

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

        //@ts-ignore
        // We do not need to explicitly provide the nodes_info property. This change needs to be made
        // in the js client
        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin?.data.id, // Ensure selectedPlugin is defined
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
    if (mutation.isSuccess || mutation.isError) {
      setTimeout(() => {
        mutation.reset();
      }, 2000);
    }
  }, [mutation.isSuccess, mutation.isError]);

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
