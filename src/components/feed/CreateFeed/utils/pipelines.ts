import { Pipeline, PipelineList, PluginPiping } from "@fnndsc/chrisapi";

import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../api/common/index";

export async function fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 100,
    offset: 0,
  };

  const pipelinePluginsFn = pipelineInstance.getPlugins;
  const pipelineFn = pipelineInstance.getPluginPipings;
  const boundPipelinePluginFn = pipelinePluginsFn.bind(pipelineInstance);
  const boundPipelineFn = pipelineFn.bind(pipelineInstance);
  const pluginPipings: PluginPiping[] = await fetchResource<PluginPiping>(
    params,
    boundPipelineFn
  );
  const pipelinePlugins: any[] = await fetchResource(
    params,
    boundPipelinePluginFn
  );
  const parameters = await pipelineInstance.getDefaultParameters({
    limit: 1000,
  });

  return {
    parameters,
    pluginPipings,
    pipelinePlugins,
  };
}

export const generatePipelineWithName = async (pipelineName: string) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstanceList: PipelineList = await client.getPipelines({
    name: pipelineName,
  });
  const pipelineInstanceId = pipelineInstanceList.data[0].id;
  const pipelineInstance: Pipeline = await client.getPipeline(
    pipelineInstanceId
  );
  const resources = await fetchResources(pipelineInstance);
  return {
    resources,
    pipelineInstance,
  };
};

export const generatePipelineWithData = async (data: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstance: Pipeline = await client.createPipeline(data);
  const resources = await fetchResources(pipelineInstance);
  return {
    resources,
    pipelineInstance,
  };
};

export async function fetchComputeInfo(
  plugin_id: number,
  dictionary_id: number
) {
  const client = ChrisAPIClient.getClient();
  const computeEnvs = await client.getComputeResources({
    plugin_id: `${plugin_id}`,
  });

  if (computeEnvs.getItems()) {
    const computeEnvData = {
      [dictionary_id]: {
        computeEnvs: computeEnvs.data,
        currentlySelected: computeEnvs.data[0].name,
      },
    };
    return computeEnvData;
  }
  return undefined;
}

export const stringToColour = (name: string) => {
  // get first alphabet in upper case
  const firstAlphabet = name.charAt(0).toLowerCase();

  // get the ASCII code of the character
  const asciiCode = firstAlphabet.charCodeAt(0);

  // number that contains 3 times ASCII value of character -- unique for every alphabet
  const colorNum =
    asciiCode.toString() + asciiCode.toString() + asciiCode.toString();

  const num = Math.round(0xffffff * parseInt(colorNum));
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const value = "rgb(" + r + ", " + g + ", " + b + ")";

  return value;
};
