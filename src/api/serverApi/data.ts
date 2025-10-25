import api, { type ApiResult } from "../api";
import type { Data } from "../types";
import { createPkgInstance } from "./pkgInstance";

export const getData = (dataID: number) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "get",
  });

export const updateDataName = (dataID: number, dataName: string) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      name: dataName,
    },
  });

export const updateDataPublic = (dataID: number, isPublic = true) =>
  api<Data>({
    endpoint: `/${dataID}/`,
    method: "put",
    json: {
      public: isPublic,
    },
  });

export const createDataWithFilepath = async (
  filepath: string,
  theName: string,
  // biome-ignore lint/correctness/noUnusedFunctionParameters: not using tags for now.
  tags?: string[],
  isPublic: boolean = false,
): Promise<ApiResult<Data>> => {
  const { status, data, errmsg } = await createPkgInstance(1, [filepath]);
  if (!data) {
    return {
      errmsg,
      status,
    };
  }

  const { feed_id: dataID } = data;

  await updateDataName(dataID, theName);

  if (isPublic) {
    await updateDataPublic(dataID, true);
  }

  const dataResult = await getData(dataID);

  return dataResult;
};
