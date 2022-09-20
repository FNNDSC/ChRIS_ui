import { Pipeline, PipelineList, PipelinePipingDefaultParameterList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { fetchResource } from "../../../../utils/index";

export async function fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 100,
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
  const parameters = await fetchResource<any>(
    params,
    boundParameterFn
  );
  // PipelinePipingDefaultParameterList
  return {
    parameters,
    pluginPipings,
    pipelinePlugins,
  };
}

export const fetchPipelines = async (perPage: number, page: number) => {
  const offset = perPage * (page - 1);
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: perPage,
    offset: offset,
  };
  const registeredPipelinesList = await client.getPipelines(params);
  const registeredPipelines = registeredPipelinesList.getItems();
  return {
    registeredPipelines,
    registeredPipelinesList,
  };
};

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
