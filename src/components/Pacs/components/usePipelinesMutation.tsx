import { LoadingOutlined } from "@ant-design/icons";
import type { Feed, Pipeline } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { getPlugin } from "../../CreateFeed/createFeedHelper";

type MutationPayload = {
  type: string;
  paths: string[];
  accessionNumber: string;
};

export const handlePipelineCreation = async (payload: MutationPayload) => {
  const { type, paths, accessionNumber } = payload;
  if (type === "anonymize and push") {
    const client = ChrisAPIClient.getClient();
    const dircopy = await getPlugin("pl-dircopy");
    if (!dircopy) {
      throw new Error("Failed to fetch the 'pl-dircopy' plugin.");
    }
    try {
      const pipelineList = await client.getPipelines({
        name: "DICOM anonymization, extract, image conversion v20231027",
      });
      const pipelines = pipelineList.getItems() as Pipeline[];
      if (pipelines.length === 0) {
        throw new Error(
          "The pipeline 'DICOM anonymization, extract, image conversion v20231027' is not registered.",
        );
      }
      const selectedPipeline = pipelines[0];

      const feeds: Feed[] = [];

      for (const path of paths) {
        // Create a plugin instance for each path
        const pluginInstance = await client.createPluginInstance(
          dircopy.data.id,
          {
            //@ts-ignore
            dir: path,
          },
        );

        if (!pluginInstance) {
          throw new Error("Failed to create plugin instance.");
        }

        // Create a workflow for each plugin instance
        await client.createWorkflow(
          selectedPipeline.data.id,
          //@ts-ignore
          {
            previous_plugin_inst_id: pluginInstance.data.id as number,
          },
        );

        // Get the feed associated with the plugin instance
        const feed = await pluginInstance.getFeed();

        // Extract the series name from the path (last segment)
        const pathSegments = path.split("/");
        const seriesName = pathSegments[pathSegments.length - 1];

        // Update the feed name with accession number and series name
        await feed?.put({
          name: `Analysis for Acc#: ${accessionNumber} - Series: ${seriesName}`,
        });

        if (!feed) {
          throw new Error("Failed to create a Feed");
        }

        feeds.push(feed);
      }

      return feeds;
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  }
};

const notificationKey = "pipelineCreation";

export const usePipelinesMutation = () => {
  const handleMutation = useMutation({
    mutationFn: ({ type, paths, accessionNumber }: MutationPayload) =>
      handlePipelineCreation({ type, paths, accessionNumber }),
    onMutate: () => {
      notification.open({
        key: notificationKey,
        message: "Processing",
        description: "Your analyses are being processed.",
        icon: <LoadingOutlined />,
        duration: 0, // Keep the notification open
      });
    },
    onSuccess: () => {
      notification.success({
        key: notificationKey,
        message: "Success",
        description: "Analyses created successfully.",
      });
    },
    onError: (error: any) => {
      notification.error({
        key: notificationKey,
        message: "Error",
        description:
          error.message ||
          "An error occurred while creating the analyses. Please try again.",
      });
    },
  });

  return {
    mutate: handleMutation.mutate,
  };
};
