// hooks/useDownloadPipeline.ts
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import ChrisAPIClient from "../../api/chrisapiclient";
import type {
  PipelineSourceFileList,
  PipelineSourceFile,
  Pipeline,
} from "@fnndsc/chrisapi";

const fetchPipelineSourceFiles = async (pipeline: Pipeline) => {
  const client = ChrisAPIClient.getClient();
  const response: PipelineSourceFileList = await client.getPipelineSourceFiles({
    //@ts-ignore
    pipeline_id: pipeline.data.id,
    pipeline_name: pipeline.data.fname,
  });

  const arrayOfPipelines = response.getItems() as PipelineSourceFile[];

  if (arrayOfPipelines.length === 0) {
    throw new Error("Failed to find a source file");
  }
  const neededPipeline = arrayOfPipelines.find(
    (currentPipeline) =>
      currentPipeline.data.pipeline_name === pipeline.data.name,
  );

  if (!neededPipeline) {
    throw new Error("Failed to find a source file");
  }

  // Get the file type (ftype) from the response
  const fileType = neededPipeline.data.ftype || "txt"; // Default to 'txt' if ftype is undefined

  // Get the pipeline name and construct the file name with extension
  const fileName = `${pipeline.data.name}.${fileType}`;

  // Get the file blob
  const blob = await neededPipeline.getFileBlob();

  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName; // Use the constructed file name
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return fileName;
};

export const useDownloadSource = () => {
  const data = useMutation({
    mutationFn: fetchPipelineSourceFiles,
    onError: (error: any) => {
      notification.error({
        message: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during download.",
      });
    },
    onSuccess: (fileName: string) => {
      notification.success({
        message: "Download Successful",
        description: `The file "${fileName}" has been downloaded successfully.`,
      });
      data.reset();
    },
  });
  return data;
};
