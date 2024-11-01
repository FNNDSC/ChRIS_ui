import axios, { type AxiosProgressEvent } from "axios";
import ChrisAPIClient from "./chrisapiclient";
import type {
  Pipeline,
  PipelineList,
  PluginPiping,
  Feed,
  Plugin,
  PipelinePipingDefaultParameterList,
  ComputeResource,
} from "@fnndsc/chrisapi";
import { quote } from "shlex";

export function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len - 3)}...`;
}

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

export const getFeedTree = (items: any[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const mappedArr = new Map<number, TreeNode>();
  const childrenMap = new Map<number, TreeNode[]>();

  items.forEach((item) => {
    const id: number = item.data.id;
    const previous_id: number | null =
      item.data.previous_id !== undefined ? item.data.previous_id : null;

    const node: TreeNode = {
      id,
      plugin_id: item.data.plugin_id,
      pipeline_id: item.data.pipeline_id,
      previous_id,
      title: item.data.title,
      plugin_name: item.data.plugin_name,
      plugin_version: item.data.plugin_version,
      children: [],
    };

    mappedArr.set(id, node);

    if (previous_id !== null) {
      const parentNode = mappedArr.get(previous_id);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // If parent hasn't been processed yet, store the child in childrenMap
        if (!childrenMap.has(previous_id)) {
          childrenMap.set(previous_id, []);
        }
        childrenMap.get(previous_id)!.push(node);
      }
    } else {
      tree.push(node);
    }

    // If there are children waiting for this node, add them
    if (childrenMap.has(id)) {
      const children = childrenMap.get(id)!;
      node.children.push(...children);
      childrenMap.delete(id);
    }
  });

  return tree;
};

export const fetchPipelines = async (
  perPage: number,
  page: number,
  search: string,
  searchType: string,
) => {
  const offset = perPage * (page - 1);
  const client = ChrisAPIClient.getClient();

  const params = {
    limit: perPage,
    offset: offset,
    [`${searchType}`]: search,
  };

  try {
    const registeredPipelinesList: PipelineList =
      await client.getPipelines(params);
    const registeredPipelines =
      (registeredPipelinesList.getItems() as Pipeline[]) || [];

    return {
      registeredPipelines,
      totalCount: registeredPipelinesList.totalCount,
    };
  } catch (error) {
    const errorObj = catchError(error);
    throw new Error(errorObj.error_message);
  }
};

interface ResourceList<T> {
  getItems(): T[] | null;
  hasNextPage: boolean;
  totalCount: number;
}

interface FetchResourceResult<T> {
  resource: T[];
  totalCount: number;
}

type FetchFunction<T> = (params: FetchParams) => Promise<ResourceList<T>>;

export const fetchResource = async <T>(
  params: FetchParams,
  fn: FetchFunction<T>,
): Promise<FetchResourceResult<T>> => {
  try {
    let resourceList = await fn(params);
    let resource: T[] = [];

    const items = resourceList.getItems();
    if (items) {
      resource = [...items];
    }

    while (resourceList.hasNextPage) {
      params.offset += params.limit;
      resourceList = await fn(params);
      const newItems = resourceList.getItems();
      if (newItems) {
        resource.push(...newItems);
      }
    }

    return {
      resource,
      totalCount: resourceList.totalCount,
    };
  } catch (error) {
    const error_message = catchError(error).error_message;

    if (error_message) {
      throw new Error(error_message);
    }

    throw new Error(
      "Unhandled error. Please reach out to @devbabymri.org to report this error",
    );
  }
};

// Type Definitions
interface FetchParams {
  [key: string]: string | number;
}

interface FetchResourcesResult {
  parameters: PipelinePipingDefaultParameterList;
  pluginPipings: PluginPiping[];
  pipelinePlugins: Plugin[];
}

export async function fetchResources(
  pipelineInstance: Pipeline,
  params: FetchParams = { limit: 100, offset: 0 },
): Promise<FetchResourcesResult> {
  try {
    const boundGetPlugins = pipelineInstance.getPlugins.bind(pipelineInstance);
    const boundGetPluginPipings =
      pipelineInstance.getPluginPipings.bind(pipelineInstance);
    const [pluginPipings, pipelinePlugins, parameters] = await Promise.all([
      fetchResource<PluginPiping>(params, boundGetPluginPipings),
      fetchResource<Plugin>(params, boundGetPlugins),
      pipelineInstance.getDefaultParameters({ limit: 1000 }),
    ]);
    return {
      parameters,
      pluginPipings: pluginPipings.resource,
      pipelinePlugins: pipelinePlugins.resource,
    };
  } catch (e) {
    // Comprehensive error handling
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    // Handles API errors
    const message = catchError(e).error_message;
    throw new Error(message);
  }
}

export const generatePipelineWithName = async (pipelineName: string) => {
  const client = ChrisAPIClient.getClient();

  const pipelineInstanceList: PipelineList = await client.getPipelines({
    name: pipelineName,
  });
  const pipelineInstanceId = pipelineInstanceList.data[0].id;
  const pipelineInstance: Pipeline = (await client.getPipeline(
    pipelineInstanceId,
  )) as Pipeline;

  try {
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  } catch (error) {
    const error_message = catchError(error).error_message;
    if (error_message) {
      throw new Error(error_message);
    }

    throw new Error(
      "Unhandled error. Please reach out to @devbabymri.org to report this error",
    );
  }
};

export const generatePipelineWithData = async (data: any) => {
  const client = ChrisAPIClient.getClient();
  const pipelineInstance: Pipeline = await client.createPipeline(data);

  try {
    const resources = await fetchResources(pipelineInstance);
    return {
      resources,
      pipelineInstance,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Unhandled error. Please reach out to @devbabymri.org to report this error",
    );
  }
};

export async function fetchComputeInfo(
  plugin_id: number,
  dictionary_id: string,
  globalCompute?: string,
) {
  try {
    const client = ChrisAPIClient.getClient();
    const computeEnvs = await client.getComputeResources({
      plugin_id: `${plugin_id}`,
    });

    const computeItems = computeEnvs.getItems();

    if (computeItems) {
      const activeCompute =
        globalCompute &&
        computeItems.some((env) => env.data.name === globalCompute)
          ? globalCompute
          : undefined;

      const length = computeEnvs.data.length;
      const currentlySelected = activeCompute
        ? activeCompute
        : (computeEnvs.data[length - 1].name as string);
      const computeEnvData = {
        [dictionary_id]: {
          computeEnvs: computeItems as ComputeResource[],
          currentlySelected,
        },
      };
      return computeEnvData;
    }
  } catch (e) {
    throw new Error("Error fetching the compute Environment");
  }
}

// src/utils/catchError.ts

export function catchError(errorRequest: any) {
  // Check if errorRequest has a response with data
  if (
    errorRequest?.response?.data &&
    typeof errorRequest.response.data === "object"
  ) {
    /*
{
  "response": {
    "data": {
      "randomErrorKey": ["ErrorMessage"]
      }
    }
  }
     */
    const data = errorRequest.response.data;
    // Iterate through each key in the data object
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Check if the value is an array with at least one message
        if (Array.isArray(value) && value.length > 0) {
          // Return the first error message found
          return { error_message: value[0] };
        }
      }
    }

    // If no valid error messages are found, return a generic error
    return { error_message: "An unknown error occurred." };
  }

  // If errorRequest has a message property, return it
  if (errorRequest?.message) {
    return { error_message: errorRequest.message as string };
  }

  // Fallback error message
  return {
    error_message: "Unexpected Error: Please report at @devbabymri.org",
  };
}

// A function to limit concurrency using Promise.allSettled.
export const limitConcurrency = async <T>(
  limit: number,
  promises: (() => Promise<T>)[],
  onProgress?: (progress: number) => void,
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
      batch.map((promise, j) => execute(promise, i + j)),
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
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
) => {
  const formData = new FormData();
  const name = file.webkitRelativePath ? file.webkitRelativePath : file.name;

  formData.append("upload_path", `${directoryName}/${name}`);
  formData.append("fname", file, name);

  const config = {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  };

  const response = await axios.post(url, formData, config);
  return response;
};

export const uploadWrapper = (
  localFiles: any[],
  directoryName: string,
  token: string,
  onUploadProgress?: (file: any, progressEvent: AxiosProgressEvent) => void,
) => {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}userfiles/`;
  return localFiles.map((file) => {
    const onUploadProgressWrap = (progressEvent: AxiosProgressEvent) => {
      onUploadProgress?.(file, progressEvent);
    };

    const promise = uploadFile(
      file,
      url,
      directoryName,
      token,
      onUploadProgressWrap,
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
    d.getDate(),
  )}-${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function fetchNote(feed?: Feed) {
  const note = await feed?.getNote();
  return note;
}

export const pluralize = (file: string, length: number) => {
  return length === 1 ? file : `${file}s`;
};

export function needsQuoting(value: string) {
  // Check if the value is already properly quoted
  const singleQuoted = value.startsWith("'") && value.endsWith("'");
  const doubleQuoted = value.startsWith('"') && value.endsWith('"');
  const isProperlyQuoted = singleQuoted || doubleQuoted;

  // If already properly quoted, return false
  if (isProperlyQuoted) {
    return false;
  }

  // Avoid shlex.quote if the string contains an apostrophe

  if (value.includes("'")) {
    return true;
  }

  // If not quoted, check if quoting is necessary
  const quotedValue = quote(value);
  return quotedValue !== value;
}

// Custom quote function to avoid mangling strings with apostrophes
export function customQuote(value: string) {
  // If the string contains a single quote, wrap it in double quotes
  if (value.includes("'")) {
    return `"${value}"`; // Wrap in double quotes
  }

  // Otherwise, fall back to shlex.quote for safe quoting
  return quote(value);
}

export const getFileName = (name: string) => {
  return name.split("/").slice(-1).join("");
};
