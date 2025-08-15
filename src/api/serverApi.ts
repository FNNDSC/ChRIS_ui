import config from "config";
import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";
import YAML from "yaml";
import api, { type ApiResult } from "./api";
import type { PACSqueryCore } from "./pfdcm";
import { PACSqueryCoreToJSON } from "./pfdcm/generated";
import type {
  DownloadToken,
  Feed,
  NodeInfo,
  PACSSeries,
  PFDCMResult,
  Plugin,
  PluginInstance,
  UploadPipeline,
} from "./types";

console.info("api.serverApi: config:", config);

export const GetFeedPluginInstances = (feedID: number) =>
  api<PluginInstance[]>({
    endpoint: `/${feedID}/plugininstances/`,
    method: "get",
  });

export const getFeed = (feedID: number) =>
  api<Feed>({
    endpoint: `/${feedID}/`,
    method: "get",
  });

export const updateFeedName = (feedID: number, feedName: string) =>
  api<Feed>({
    endpoint: `/${feedID}/`,
    method: "put",
    json: {
      name: feedName,
    },
  });

export const updateFeedPublic = (feedID: number, isPublic = true) =>
  api<Feed>({
    endpoint: `/${feedID}/`,
    method: "put",
    json: {
      public: isPublic,
    },
  });

export const searchPluginsByName = (pluginName: string) =>
  api<Plugin[]>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: pluginName,
    },
  });

export const createPluginInstance = (pluginID: number, theDirs: string[]) =>
  api<PluginInstance>({
    endpoint: `/plugins/${pluginID}/instances/`,
    method: "post",
    json: {
      previous_id: null,
      dir: theDirs.join(","),
    },
  });

export const createWorkflow = (
  pipelineID: number,
  previousPluginInstanceID: number,
  nodesInfo: NodeInfo[],
) =>
  api({
    endpoint: `/pipelines/${pipelineID}/workflows/`,
    method: "post",
    json: {
      template: {
        data: [
          {
            name: "previous_plugin_inst_id",
            value: `${previousPluginInstanceID}`,
          },
          { name: "nodes_info", value: JSON.stringify(nodesInfo) },
        ],
      },
    },
    headers: {
      "Content-Type": "application/vnd.collection+json",
    },
  });

type createFeedWithFilepathProp = {
  filepath: string;
  theName: string;
  tags: string[];
  patientID?: string;
  modality?: string;
  studyDate?: string;
  isPublic?: boolean;
};
export const createFeedWithFilepath = async ({
  filepath,
  theName,
  tags,
  patientID,
  modality,
  studyDate,
  isPublic,
}: createFeedWithFilepathProp): Promise<ApiResult<Feed>> => {
  const pluginInstanceResult = await createPluginInstance(1, [filepath]);
  if (!pluginInstanceResult.data) {
    return {
      errmsg: pluginInstanceResult.errmsg,
      status: pluginInstanceResult.status,
    };
  }

  const {
    data: { feed_id: feedID },
  } = pluginInstanceResult;

  await updateFeedName(feedID, theName);

  if (isPublic) {
    await updateFeedPublic(feedID, true);
  }

  const feedResult = await getFeed(feedID);

  return feedResult;
};

export const createPipeline = (pipeline: UploadPipeline) =>
  api({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });

export const createDownloadToken = () =>
  api<DownloadToken>({
    endpoint: "/downloadtokens/",
    method: "post",
    json: {
      template: {
        data: [],
      },
    },
  });

export const getPACSSeriesListByStudyUID = (studyUID: string) =>
  api<PACSSeries[]>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      StudyInstanceUID: studyUID,
    },
  });

export const getPACSSeriesListBySeriesUID = (seriesUID: string) =>
  api<PACSSeries[]>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      SeriesInstanceUID: seriesUID,
    },
  });

export const queryPFDCMStudies = (service: string, query: PACSqueryCore) => {
  // @ts-expect-error study-only
  query.StudyOnly = true;

  return api<PFDCMResult>({
    endpoint: "/PACS/sync/pypx/",
    method: "post",
    json: {
      PACSdirective: query,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });
};

export const queryPFDCMSeries = (service: string, query: PACSqueryCore) =>
  api<PFDCMResult>({
    endpoint: "/PACS/sync/pypx/",
    method: "post",
    json: {
      PACSdirective: query,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });

export const getPFDCMServices = () =>
  api<ReadonlyNonEmptyArray<string>>({
    endpoint: "/PACSservice/list/",
    method: "get",
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });

export const retrievePFDCMPACS = (service: string, query: PACSqueryCore) => {
  const queryJSON = PACSqueryCoreToJSON(query);
  // biome-ignore lint/suspicious/noThenProperty: required by PACSqueryCore
  queryJSON.then = "retrieve";
  queryJSON.withFeedBack = true;

  return api<PFDCMResult>({
    endpoint: "/PACS/thread/pypx/",
    method: "post",
    json: {
      PACSdirective: queryJSON,
      PACSservice: { value: service },
      listenerService: { value: "default" },
    },
    apiroot: config.PFDCM_ROOT,
    isJson: true,
  });
};

export const queryPACSSeries = (service: string, seriesInstanceUID: string) =>
  api<PACSSeries[]>({
    endpoint: "/pacs/series/search/",
    method: "get",
    query: {
      pacs_name: service,
      SeriesInstanceUID: seriesInstanceUID,
      limit: 1,
    },
  });
