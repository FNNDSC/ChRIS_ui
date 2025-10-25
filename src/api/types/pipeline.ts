import type { Datetime } from "./datetime";
import type { ID } from "./id";
import type { UploadPkgNodeInfo } from "./pkgNode";

export type Pipeline = {
  id: ID;
  owner_username: string;
  name: string;
  name_exact: string;
  category: string;
  description: string;
  authors: string;
  min_creation_date: Datetime;
};

export interface UploadPipeline {
  name: string;
  authors: string;
  category: string;
  description: string;
  locked: false;
  plugin_tree: UploadPkgNodeInfo[];
}
