import * as React from "react";
import axios from "axios";
import ChrisAPIClient from "./chrisapiclient";
import { Pipeline, PipelineList, PluginPiping } from "@fnndsc/chrisapi";

export function useSafeDispatch(dispatch: any) {
  const mounted = React.useRef(false);
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return React.useCallback(
    (...args: any[]) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch]
  );
}

const defaultInitialState = {
  status: "idle",
  data: null,
  error: null,
};

function useAsync(initialState?: any) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    initialState,
  });

  const [{ status, data, error }, setState] = React.useReducer(
    (s: any, a: any) => ({ ...s, ...a }),
    initialStateRef.current
  );

  const safeSetState = useSafeDispatch(setState);
  const setData = React.useCallback(
    (data: any) => safeSetState({ data, status: "resolved" }),
    [safeSetState]
  );
  const setError = React.useCallback(
    (error: any) => safeSetState({ error, status: "rejected" }),
    [safeSetState]
  );
  const reset = React.useCallback(
    () => safeSetState(initialStateRef.current),
    [safeSetState]
  );

  const run = React.useCallback(
    (promise: any) => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise`
        );
      }
      safeSetState({ status: "pending" });
      return promise.then(
        (data: any) => {
          setData(data);
          return data;
        },
        (error: any) => {
          setError(error);
          return Promise.reject(error);
        }
      );
    },
    [safeSetState, setData, setError]
  );

  return {
    isIdle: status === "idle",
    isLoading: status === "pending",
    isError: status === "rejected",
    isSuccess: status === "resolved",

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  };
}

async function fetchResource<T>(
  params: {
    limit: number;
    offset: number;
    fname_icontains?: string;
    fname_nslashes?: string;
  },
  fn: any
) {
  let resourceList = await fn(params);
  let resource: T[] = [];
  if (resourceList.getItems()) {
    resource = resourceList.getItems() as T[];
  }
  while (resourceList.hasNextPage) {
    try {
      params.offset += params.limit;
      resourceList = await fn(params);
      if (resourceList.getItems()) {
        resource.push(...(resourceList.getItems() as T[]));
      }
    } catch (e) {
      console.error(e);
    }
  }
  return {
    resource,
    totalCount: resourceList.totalCount,
  };
}

export { useAsync, fetchResource };

export interface TreeType {
  id: number;
  plugin_id: number;
  pipeline_id: number;
  previous_id: number | null;
}
export interface TreeNode {
  children: TreeType[];
  id: number;
  plugin_id: number;
  pipeline_id: number;
  previous_id: number | null;
  title: string;
  plugin_name: string;
  plugin_version: string;
}

export const getFeedTree = (items: any[]) => {
  const tree = [],
    mappedArr: {
      [key: string]: TreeNode;
    } = {};

  items.forEach((item) => {
    const id = item.data.id;
    if (!mappedArr.hasOwnProperty(id)) {
      mappedArr[id] = {
        id: id,
        plugin_id: item.data.plugin_id,
        pipeline_id: item.data.pipeline_id,
        previous_id: item.data.previous_id && item.data.previous_id,
        title: item.data.title,
        plugin_name: item.data.plugin_name,
        plugin_version: item.data.plugin_version,
        children: [],
      };
    }
  });

  for (const id in mappedArr) {
    let mappedElem;
    if (mappedArr.hasOwnProperty(id)) {
      mappedElem = mappedArr[id];
      if (mappedElem.previous_id) {
        const parentId = mappedElem.previous_id;
        if (parentId && mappedArr[parentId] && mappedArr[parentId].children) {
          mappedArr[parentId].children.push(mappedElem);
        }
      } else tree.push(mappedElem);
    }
  }
  return tree;
};

export const fetchPipelines = async (
  perPage: number,
  page: number,
  search: string,
  searchType: string
) => {
  let errorPayload: any = {};
  let registeredPipelinesList, registeredPipelines;
  const offset = perPage * (page - 1);
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: perPage,
    offset: offset,
    [`${searchType}`]: search,
  };
  try {
    registeredPipelinesList = await client.getPipelines(params);
    registeredPipelines = registeredPipelinesList.getItems();
  } catch (error) {
    errorPayload = error;
  }

  return {
    registeredPipelines,
    registeredPipelinesList,
    error: errorPayload,
  };
};

export async function fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 100,
    offset: 0,
  };

  const pipelinePluginsFn = pipelineInstance.getPlugins;
  const pipelineFn = pipelineInstance.getPluginPipings;
  const boundPipelinePluginFn = pipelinePluginsFn.bind(pipelineInstance);
  const boundPipelineFn = pipelineFn.bind(pipelineInstance);
  const { resource: pluginPipings } = await fetchResource<PluginPiping>(
    params,
    boundPipelineFn
  );
  const { resource: pipelinePlugins } = await fetchResource(
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

export function catchError(errorRequest: any) {
  if (errorRequest.response) {
    return errorRequest.response.data;
  } else if (errorRequest.message) {
    return { error_message: errorRequest.message };
  } else {
    return { error_message: errorRequest };
  }
}

// A function to limit concurrency using Promise.allSettled.
export const limitConcurrency = async <T>(
  limit: number,
  promises: (() => Promise<T>)[],
  onProgress?: (progress: number) => void
): Promise<T[]> => {
  const results: T[] = [];
  const executing: Promise<T>[] = [];
  let settledCount = 0;

  // // A helper function to execute a promise and update the results and executing arrays.

  const execute = async (promise: () => Promise<T>, i: number) => {
    const promiseResult = promise();

    executing.push(promiseResult);

    return promiseResult
      .then((result) => {
        results[i] = result;
      })
      .catch((err) => {
        results[i] = err;
      })
      .finally(() => {
        // Remove the Promise from the executing array once the Promise has settled.
        executing.splice(executing.indexOf(promiseResult), 1);
        settledCount++;
        if (onProgress) {
          const progress = Math.round((settledCount / promises.length) * 100);
          onProgress(progress);
        }
      });
  };

  // Create batches of promises to be executed concurrently

  const batches = [];
  for (let i = 0; i < promises.length; i += limit) {
    const batch = promises.slice(i, i + limit);
    const batchPromise = Promise.allSettled(
      batch.map((promise, j) => execute(promise, i + j))
    );

    batches.push(batchPromise);
  }

  await Promise.allSettled(batches);
  if (onProgress) {
    onProgress(100);
  }

  return results;
};

export const uploadFile = async (
  file: File,
  url: string,
  directoryName: string,
  token: string,
  onUploadProgress: (progressEvent: ProgressEvent) => void
) => {
  const formData = new FormData();
  const name = file.name;
  formData.append("upload_path", `${directoryName}/${name}`);
  formData.append("fname", file, name);

  const config = {
    headers: { Authorization: "Token " + token },
    onUploadProgress,
  };

  const response = await axios.post(url, formData, config);

  return response;
};

export const uploadWrapper = (
  localFiles: any[],
  client: any,
  directoryName: string,
  token: string,
  onUploadProgress?: (file: any, progressEvent: ProgressEvent) => void
) => {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}uploadedfiles/`;
  return localFiles.map((file) => {
    const onUploadProgressWrap = (progressEvent: ProgressEvent) => {
      onUploadProgress && onUploadProgress(file, progressEvent);
    };

   

    const promise = uploadFile(
      file,
      url,
      directoryName,
      token,
      onUploadProgressWrap
    );

    return {
      file,
      promise,
    };
  });
};

export function getTimestamp() {
  const pad = (n: any, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
  const d = new Date();
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}-${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
