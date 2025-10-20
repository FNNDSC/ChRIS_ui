import config from "config";
import type { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";
import YAML from "yaml";
import api from "./api";
import { STATUS_OK } from "./constants";
import type { PACSqueryCore } from "./pfdcm";
import { PACSqueryCoreToJSON } from "./pfdcm/generated";
import type {
  AuthToken,
  DownloadToken,
  Feed,
  Link,
  NodeInfo,
  PACSSeries,
  PFDCMResult,
  Plugin,
  PluginInstance,
  UploadPipeline,
  User,
} from "./types";

console.info("api.serverApi: config:", config);

export const createUser = (username: string, password: string, email: string) =>
  api<User>({
    endpoint: "/users/",
    apiroot: config.USER_ROOT,
    json: {
      username,
      password,
      email,
    },
    method: "post",
    isSignUpLogin: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getAuthToken = (username: string, password: string) =>
  api<AuthToken>({
    endpoint: "/auth-token/",
    apiroot: config.AUTH_ROOT,
    json: {
      username,
      password,
    },
    method: "post",
    isSignUpLogin: true,
    isJson: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUserID = async (): Promise<string> => {
  const { status, data, errmsg } = await getLinkMap();
  if (!data) {
    return "";
  }
  if (status !== STATUS_OK) {
    return "";
  }

  const userLink = data.user;
  if (!userLink) {
    return "";
  }
  const userLinkList = userLink.split("/");
  return userLinkList[userLinkList.length - 2];
};

export const getUser = (userID: string) =>
  api<User>({
    endpoint: `/users/${userID}/`,
  });

export const getLinkMap = () =>
  api<Link>({
    endpoint: "/",
    isLink: true,
    query: { limit: 1 },
  });

export const getDataInstances = (dataID: number) =>
  api<PluginInstance[]>({
    endpoint: `/${dataID}/plugininstances/`,
    method: "get",
  });

export const getData = (dataID: number) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "get",
  });

export const updateDataName = (dataID: number, dataName: string) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      name: dataName,
    },
  });

export const updateDataPublic = (dataID: number, isPublic = true) =>
  api<Feed>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      public: isPublic,
    },
  });

export const searchPrimitivePackagesByName = (packageName: string) =>
  api<Plugin[]>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: packageName,
    },
  });

export const createPrimitivePackageInstance = (
  packageID: number,
  theDirs: string[],
) =>
  api<PluginInstance>({
    endpoint: `/plugins/${packageID}/instances/`,
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

export const createDataWithFilepath = async (
  filepath: string,
  theName: string,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: not using tags for now.
  tags?: string[],
  isPublic: boolean = false,
) => {
  const pluginInstanceResult = await createPrimitivePackageInstance(1, [
    filepath,
  ]);
  if (!pluginInstanceResult.data) {
    return {
      errmsg: pluginInstanceResult.errmsg,
      status: pluginInstanceResult.status,
    };
  }

  const {
    data: { feed_id: feedID },
  } = pluginInstanceResult;

  await updateDataName(feedID, theName);

  if (isPublic) {
    await updateDataPublic(feedID, true);
  }

  const feedResult = await getData(feedID);

  return feedResult;
};

export const createPackage = (pipeline: UploadPipeline) =>
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
