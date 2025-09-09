import config from "config";
import { Cookies } from "react-cookie";
import { STATUS_UNAUTHORIZED } from "./constants";

export type Query = Record<string, any>;

export type Params = Record<string, any>;

export type Files = Record<string, any>;

export interface CallAPI<T> {
  endpoint: string;
  method?: string;
  query?: Query;
  params?: Params;
  json?: any;
  headers?: any;
  filename?: string;
  filetext?: string;
  apiroot?: string;
  isJson?: boolean;
}

interface ApiParams {
  query?: Query;
  method?: string;
  params?: Params;
  json?: any;
  headers?: any;
  filename?: string;
  filetext?: string;
  apiroot?: string;
  isJson?: boolean;
}

export interface ApiResult<T> {
  status: number;
  data?: T;
  errmsg?: string;
  text?: string;
  blob?: Blob;
}

const serialize = (data: any): string => {
  let dataStr = data;
  if (typeof data === "object") {
    dataStr = JSON.stringify(data);
  }

  return encodeURIComponent(dataStr);
};

const queryToString = (query: Query | Params) =>
  Object.keys(query)
    .map((k) => `${serialize(k)}=${serialize(query[k])}`)
    .join("&");

let _COOKIE: any = null;

export const getToken = () => {
  const cookie = new Cookies(_COOKIE);
  console.info("api.getToken: cookie is _COOKIE:", cookie === _COOKIE);
  _COOKIE = cookie;
  const username = cookie.get("username");
  const token: string = cookie.get(`${username}_token`);
  return token;
};

const collectionJsonItemToJson = (item: any) =>
  item.data.reduce((r: any, x: any) => {
    const { name, value } = x;
    r[name] = value;
    return r;
  }, {});

export const collectionJsonToJson = (theData: any) => {
  const ret = theData.collection.items.map(collectionJsonItemToJson);
  return typeof theData.collection.total === "undefined" ? ret[0] : ret;
};

const callApi = async <T>(
  endpoint: string,
  {
    query,
    method = "get",
    params,
    json,
    headers: paramsHeaders,
    filename,
    filetext: paramsFiletext,
    apiroot: paramsAPIRoot,
    isJson,
  }: ApiParams,
): Promise<ApiResult<T>> => {
  const { API_ROOT: CONFIG_API_ROOT } = config;

  const default_api_root = window.location.origin;

  let API_ROOT = paramsAPIRoot || CONFIG_API_ROOT || default_api_root;
  if (API_ROOT.length >= 1 && API_ROOT[API_ROOT.length - 1] === "/") {
    API_ROOT = API_ROOT.slice(0, API_ROOT.length - 1);
  }

  let theEndpoint = endpoint;
  if (!theEndpoint.includes(API_ROOT)) {
    theEndpoint = `${API_ROOT}${endpoint}`;
  }

  if (query) {
    theEndpoint = `${theEndpoint}?${queryToString(query)}`;
  }

  if (filename) {
    const filetext = paramsFiletext || "";
    return await postFile(theEndpoint, filename, filetext);
  }

  const token = getToken();

  const headers: HeadersInit = {
    Authorization: `Token ${token}`,
  };

  let body: string | undefined;
  if (params) {
    const paramsStr = queryToString(params);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = paramsStr;
  } else if (json) {
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }
  const theHeaders = paramsHeaders || {};
  Object.assign(headers, theHeaders);

  const options: RequestInit = {
    method,
    headers,
    body,
  };

  return await fetchCore<T>(theEndpoint, options, isJson);
};

const postFile = async <T>(
  theEndpoint: string,
  filename: string,
  filetext: string,
) => {
  const blob = new Blob([filetext], { type: "text/plain" });
  const formData = new FormData();
  formData.append(filename, blob, filename);

  const token = getToken();

  const headers: HeadersInit = {
    Authorization: `Token ${token}`,
    Accept: "application/json",
  };

  return await fetchCore<T>(
    theEndpoint,
    { method: "POST", headers, body: formData },
    true,
  );
};

const getCurrentPathQeury = () => {
  const searchStr = getCurrentPathQeurySanitizeSearch(window.location.search);
  return `${window.location.pathname}${searchStr}`;
};

const getCurrentPathQeurySanitizeSearch = (search: string) => {
  if (!search) {
    return "";
  }

  // if with only '?': remove '?'
  if (search[0] === "?" && search.length === 1) {
    return "";
  }

  // if not starting with '?': add '?'
  if (search[0] !== "?") {
    return `?${search}`;
  }

  return search;
};

const fetchCore = async <T>(
  endpoint: string,
  options: RequestInit,
  isJson = false,
): Promise<ApiResult<T>> => {
  return await fetch(endpoint, options)
    .then((res) => {
      const status = res.status;
      return res
        .json()
        .then((collectionJsonData) => {
          if (res.status === STATUS_UNAUTHORIZED) {
            const redirectTo = encodeURIComponent(getCurrentPathQeury());
            window.location.href = `/login?redirectTo=${redirectTo}`;
          }

          if (res.status >= 400) {
            const msg = collectionJsonData.error;
            return { status, errmsg: msg };
          }

          const jsonData = isJson
            ? collectionJsonData
            : collectionJsonToJson(collectionJsonData);

          console.info(
            "api.callApi: jsonData:",
            jsonData,
            "collectionJsonData:",
            collectionJsonData,
          );

          const data = jsonData;

          return { status: res.status, data: data };
        })
        .catch((err) => {
          console.error("api.callApi: json: err:", err);

          return { status: 598, errmsg: err.message };
        });
    })
    .catch((err) => {
      return { status: 599, errmsg: err.message };
    });
};

export default <T>(callAPI: CallAPI<T>): Promise<ApiResult<T>> => {
  const {
    endpoint,
    method,
    query,
    params,
    filename,
    filetext,
    json,
    headers,
    apiroot,
    isJson,
  } = callAPI;

  return callApi<T>(endpoint, {
    method,
    query,
    params,
    filename,
    filetext,
    json,
    headers,
    apiroot,
    isJson,
  });
};
