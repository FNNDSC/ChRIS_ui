import YAML from "yaml";
import api from "../api";
import type { List, Pkg, UploadPipeline } from "../types";

export const searchPkgsByName = (packageName: string) =>
  api<List<Pkg>>({
    endpoint: "/plugins/search/",
    method: "get",
    query: {
      name: packageName,
    },
  });

export const createPkg = (pipeline: UploadPipeline) =>
  api({
    endpoint: "/pipelines/sourcefiles/",
    method: "post",
    filename: "fname",
    filetext: YAML.stringify(pipeline),
  });
