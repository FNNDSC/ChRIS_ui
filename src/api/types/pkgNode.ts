import type { ID } from "./id";

// legacy: piping
export interface PkgNode {
  id: ID;
  pipeline_id: ID;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  title: string;
  previous_id: ID | null;
}

export interface PkgNodeInfo {
  piping_id: ID;
  previous_piping_id: ID | null;
  compute_resource_name: string;
  title: string;
}

// legacy: pipeline-default-parameter
export interface PkgNodeDefaultParameter {
  id: ID;
  param_id: ID;
  param_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_piping_id: ID;
  plugin_piping_title: string;
  plugin_version: string;
  previous_plugin_piping_id: ID | null;
  type: string;
  value: any;
}

export interface UploadPkgNodeInfo {
  title: string;
  previous: string | null;
  plugin: string;
  plugin_parameter_defaults?: { [key: string | number]: any };
}
