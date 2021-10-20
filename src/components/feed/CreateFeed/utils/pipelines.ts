import { Pipeline, PipelineList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../utils/index";

async function fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 20,
    offset: 0,
  };

  const pipelinePluginsFn = pipelineInstance.getPlugins;
  const pipelineFn = pipelineInstance.getPluginPipings;
  const parameterFn = pipelineInstance.getDefaultParameters;
  const boundPipelinePluginFn = pipelinePluginsFn.bind(pipelineInstance);
  const boundPipelineFn = pipelineFn.bind(pipelineInstance);
  const boundParameterFn = parameterFn.bind(pipelineInstance);
  const pluginPipings: any[] = await fetchResource(params, boundPipelineFn);
  const pipelinePlugins: any[] = await fetchResource(
    params,
    boundPipelinePluginFn
  );
  const parameters: any[] = await fetchResource(params, boundParameterFn);

  return {
    parameters,
    pluginPipings,
    pipelinePlugins,
  };
}

export const generatePipeline = async (pipelineName: string, data?: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstanceList: PipelineList = await client.getPipelines({
    name: pipelineName,
  });
  if (pipelineInstanceList.data) {
    const pipelineInstanceId = pipelineInstanceList.data[0].id;
    const pipelineInstance: Pipeline = await client.getPipeline(
      pipelineInstanceId
    );
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  } else {
    const pipelineInstance: Pipeline = await client.createPipeline(data);
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  }
};

export async function fetchComputeInfo(
  plugin_id: number,
  dictionary_id: number
) {
  const client = ChrisAPIClient.getClient();
  const computeEnvs = await client.getComputeResources({
    plugin_id: `${plugin_id}`,
  });

  console.log("Compute Envs", computeEnvs);

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
