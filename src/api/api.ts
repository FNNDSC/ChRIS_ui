import config from "config";
import { Cookies } from "react-cookie";

export type Query = Record<string, any>;

export type Params = Record<string, any>;

export type Files = Record<string, any>;

export interface CallAPI<T> {
  endpoint: string;
  method?: string;
  query?: Query;
  params?: Params;
  isFile?: boolean;
  json?: any;
  headers?: any;
}

interface ApiParams {
  query?: Query;
  method?: string;
  params?: Params;
  isFile?: boolean;
  json?: any;
  headers?: any;
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

const getToken = () => {
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

const collectionJsonToJson = (theData: any) =>
  theData.collection.items.map(collectionJsonItemToJson);

const callApi = <T>(
  endpoint: string,
  {
    query,
    method = "get",
    params,
    isFile,
    json,
    headers: paramsHeaders,
  }: ApiParams,
): Promise<ApiResult<T>> => {
  const { API_ROOT: CONFIG_API_ROOT } = config;

  const default_api_root = window.location.origin;

  let API_ROOT = CONFIG_API_ROOT || default_api_root;
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

  const token = getToken();

  const headers: HeadersInit = {
    Authorization: `Token ${token}`,
  };
  let body: string | undefined = undefined;
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

  if (isFile) {
    return fetchFiles(theEndpoint, options);
  }

  return fetch(theEndpoint, options)
    .then((res) => {
      const status = res.status;
      return res
        .json()
        .then((collectionJsonData) => {
          if (res.status >= 400) {
            const msg = collectionJsonData.error;
            return { status, errmsg: msg };
          }

          const jsonData = collectionJsonToJson(collectionJsonData);

          console.info(
            "api.callApi: jsonData:",
            jsonData,
            "collectionJsonData:",
            collectionJsonData,
          );

          const data =
            typeof collectionJsonData.collection.total === "undefined"
              ? jsonData[0]
              : jsonData;

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

const fetchFiles = <T>(
  theEndpoint: string,
  options: RequestInit,
): Promise<ApiResult<T>> => {
  return fetch(theEndpoint, options)
    .then((res) => {
      const status = res.status;
      return res.text().then((text) => {
        return { status, text };
      });
    })
    .catch((err) => {
      return { status: 599, errmsg: err.message };
    });
};

export default <T>(callAPI: CallAPI<T>): Promise<ApiResult<T>> => {
  const { endpoint, method, query, params, isFile, json, headers } = callAPI;

  return callApi<T>(endpoint, { method, query, params, isFile, json, headers });
};
