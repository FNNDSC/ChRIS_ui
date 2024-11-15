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
  formData?: AnonymizeTags;
};

export type AnonymizeTags = { [tagName: string]: string };

export const handlePipelineCreation = async (payload: MutationPayload) => {
  const { type, paths, accessionNumber, formData } = payload;
  if (type !== "anonymize and push") return;

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

    // Get plugin pipings and find the target piping
    const pluginPipings = await selectedPipeline.getPluginPipings({
      limit: 100,
    });
    const piping = pluginPipings.data.find(
      (p) => p.plugin_name === "pl-dicom_headeredit",
    );
    if (!piping) {
      throw new Error(
        "The plugin 'pl-dicom_headeredit' is not found in the pipeline.",
      );
    }

    // Get default parameters and find 'tagInfo' parameter
    const defaultParametersList = await selectedPipeline.getDefaultParameters({
      limit: 10000,
    });
    const allParams = defaultParametersList.data.filter(
      (param) => param.plugin_piping_id === piping.id,
    );
    const tagInfoParam = allParams.find(
      (param) => param.param_name === "tagInfo",
    );

    // Compute workflow nodes info and update the target node
    const nodes_info = client.computeWorkflowNodesInfo(
      defaultParametersList.data,
    );
    const targetNode = nodes_info.find((node) => node.piping_id === piping.id);

    if (targetNode && formData && tagInfoParam) {
      const updatedTagInfoParam = updateTagInfoParam(tagInfoParam, formData);
      targetNode.plugin_parameter_defaults = [updatedTagInfoParam];
    }

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

      // Prepare the workflow creation data
      const workflowData: any = {
        previous_plugin_inst_id: pluginInstance.data.id as number,
        nodes_info: nodes_info ? JSON.stringify(nodes_info) : undefined,
      };

      // Create a workflow for each plugin instance
      await client.createWorkflow(selectedPipeline.data.id, workflowData);

      // Get the feed associated with the plugin instance
      const feed = await pluginInstance.getFeed();

      // Extract the series name from the path (last segment)
      const seriesName = path.split("/").pop() || "Unknown Series";

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
};

const notificationKey = "pipelineCreation";

export const usePipelinesMutation = () => {
  const handleMutation = useMutation({
    mutationFn: handlePipelineCreation,
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

function updateTagInfoParam(tagInfoParam: any, formData: AnonymizeTags): any {
  const tagMap: { [key: string]: string } = {};

  // Split the existing value into tag-value pairs and populate tagMap
  tagInfoParam.value.split(" ++ ").forEach((pair: string) => {
    const [tagName, value] = pair.split(",");
    if (tagName && value) {
      tagMap[tagName] = value;
    }
  });

  // Update tagMap with formData values
  Object.entries(formData).forEach(([tagName, formValue]) => {
    if (formValue) {
      tagMap[tagName] = formValue;
    }
  });

  // Reconstruct the updated 'value' string
  const updatedValue = Object.entries(tagMap)
    .map(([tagName, value]) => `${tagName},${value}`)
    .join(" ++ ");

  return { name: "tagInfo", default: updatedValue };
}
