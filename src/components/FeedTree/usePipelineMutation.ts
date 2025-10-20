import type { PluginInstance } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getSelectedPlugin,
  setPluginInstancesAndSelectedPlugin,
} from "../../store/pluginInstance/pluginInstanceSlice";

export default (
  selectedPlugin: PluginInstance | undefined,
  pluginInstances: PluginInstance[],
  dispatch: any,
) => {
  const [api, contextHolder] = notification.useNotification();

  const fetchPipelines = async () => {
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
        const workflow = await client.createWorkflow(id, {
          previous_plugin_inst_id: selectedPlugin?.data.id,
        });

        const pluginInstancesResponse = await workflow.getPluginInstances({
          limit: 1000,
        });

        const instanceItems = pluginInstancesResponse.getItems();

        if (instanceItems && instanceItems.length > 0) {
          const firstInstance = instanceItems[instanceItems.length - 1];
          const completeList = [...pluginInstances, ...instanceItems];

          dispatch(getSelectedPlugin(firstInstance));

          const pluginInstanceObj = {
            selected: firstInstance,
            pluginInstances: completeList,
          };

          dispatch(setPluginInstancesAndSelectedPlugin(pluginInstanceObj));
          //dispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }
      } else {
        throw new Error(
          "The pipeline to zip is not registered. Please contact an admin",
        );
      }
      return pipelines;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: fetchPipelines,
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      api.success({
        message: "Zipping process started...",
      });
      mutation.reset();
    } else if (mutation.isError) {
      api.error({
        message: (mutation.error as Error).message,
      });
    } else if (mutation.isPending) {
      api.info({
        message: "Preparing to initiate the zipping process...",
      });
    }
  }, [
    api,
    mutation.error,
    mutation.isSuccess,
    mutation.isError,
    mutation.isPending,
    mutation.reset,
  ]);

  return { mutation, contextHolder };
};
