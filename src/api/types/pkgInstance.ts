import type { Datetime } from "./datetime";
import type { ID } from "./id";

export enum PkgInstanceStatus {
  SUCCESS = "finishedSuccessfully",
}

// legacy: plugin-instance
export interface PkgInstance {
  id: ID;
  title: string;
  previous_id: number;
  compute_resource_name: string;
  plugin_id: ID;
  plugin_name: string;
  plugin_version: string;
  plugin_type: string;
  feed_id: ID;
  start_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  end_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  output_path: string;
  status: PkgInstanceStatus;
  pipeline_id: ID;
}
