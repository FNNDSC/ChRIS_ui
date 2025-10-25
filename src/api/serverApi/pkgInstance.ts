import api from "../api";
import type { PkgInstance } from "../types";

export const getPkgInstances = (dataID: number) =>
  api<PkgInstance[]>({
    endpoint: `/${dataID}/plugininstances/`,
    method: "get",
  });

export const createPkgInstance = (packageID: number, theDirs: string[]) =>
  api<PkgInstance>({
    endpoint: `/plugins/${packageID}/instances/`,
    method: "post",
    json: {
      previous_id: null,
      dir: theDirs.join(","),
    },
  });
