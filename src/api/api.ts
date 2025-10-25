import config from "config";
import { Cookies } from "react-cookie";
import type { List } from "../api/types";
import { STATUS_UNAUTHORIZED } from "./constants";

export type Query = Record<string, any>;

export type Params = Record<string, any>;

export type Files = Record<string, any>;

export interface ApiParams {
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
  isLink?: boolean;
  isSignUpLogin?: boolean;
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

export const refreshCookie = () => {
  _COOKIE = new Cookies(null);
};

export const getToken = () => {
  if (!_COOKIE) {
    _COOKIE = new Cookies(_COOKIE);
  }
  const username = _COOKIE.get("username");
  const token: string = _COOKIE.get(`${username}_token`);
  return token;
};

const collectionJsonItemToJson = (item: any) =>
  item.data.reduce((r: any, x: any) => {
    const { name, value } = x;
    r[name] = value;
    return r;
  }, {});

const collectionJsonLinkToJson = (links: any[]) => {
  return links.reduce((r: any, x: any) => {
    const key = x.rel;
    const link = x.href;
    r[key] = link;
    return r;
  }, {});
};

export const collectionJsonToJson = <T>(
  theData: any,
  isLink = false,
): T | T[] | List<T> => {
  if (isLink) {
    return collectionJsonLinkToJson(theData.collection.links);
  }
  const ret = theData.collection.items.map(collectionJsonItemToJson);
  return typeof theData.collection.total === "undefined" ? ret[0] : ret;
};

export const sanitizeAPIRootURL = (API_ROOT: string) => {
  if (API_ROOT.length >= 1 && API_ROOT[API_ROOT.length - 1] === "/") {
    return API_ROOT.slice(0, API_ROOT.length - 1);
  }

  return API_ROOT;
};

export default async <T>(apiParams: ApiParams): Promise<ApiResult<T>> => {
  const {
    endpoint,
    query,
    method = "get",
    params,
    json,
    headers: paramsHeaders,
    filename,
    filetext: paramsFiletext,
    apiroot: paramsAPIRoot,
    isJson,
    isLink,
    isSignUpLogin,
  } = apiParams;

  const { API_ROOT: CONFIG_API_ROOT } = config;

  const default_api_root = window.location.origin;

  const theAPIRootURL = paramsAPIRoot || CONFIG_API_ROOT || default_api_root;
  const API_ROOT = sanitizeAPIRootURL(theAPIRootURL);

  let theEndpoint = endpoint;
  if (!theEndpoint.includes(API_ROOT)) {
    theEndpoint = `${API_ROOT}${endpoint}`;
  }

  if (query) {
    theEndpoint = `${theEndpoint}?${queryToString(query)}`;
  }

  // XXX special case for uploading files.
  if (filename) {
    const filetext = paramsFiletext || "";
    return await postFile(theEndpoint, filename, filetext);
  }

  // init header with token
  const headers: HeadersInit = {};

  if (!isSignUpLogin) {
    const token = getToken();
    headers.Authorization = `Token ${token}`;
  }

  // setup body
  let body: string | undefined;
  if (params) {
    const paramsStr = queryToString(params);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = paramsStr;
  } else if (json) {
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }

  // post-setup header
  const theHeaders = paramsHeaders || {};
  Object.assign(headers, theHeaders);

  const options: RequestInit = {
    method,
    headers,
    body,
  };

  return await fetchCore<T>(theEndpoint, options, isJson, isLink);
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
  isLink = false,
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
            : collectionJsonToJson(collectionJsonData, isLink);

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
