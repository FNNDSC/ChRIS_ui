export interface Feed {
  id: number;
  creation_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  modification_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  name: string;
  public: boolean;
  owner_username: string;
  folder_path: string; // home/{username}/feeds/feed_{id}
  created_jobs: number;
  waiting_jobs: number;
  scheduled_jobs: number;
  started_jobs: number;
  registering_jobs: number;
  finished_jobs: number;
  errored_jobs: number;
  cancelled_jobs: number;
}

export interface PluginInstance {
  id: number;
  title: string;
  previous_id: number;
  compute_resource_name: string;
  plugin_id: number;
  plugin_name: string;
  plugin_version: string;
  plugin_type: string;
  feed_id: number;
  start_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  end_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  output_path: string;
  status: string;
  pipeline_id: number;
}

export interface Plugin {
  id: number;
  creation_date: string; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  name: string;
  version: string;
  dock_image: string;
  public_repo: string;
  icon: string;
  type: string;
  stars: number;
  authors: string;
  title: string;
  description: string;
  documentation: string;
  license: string;
  execshell: string;
  selfpath: string;
  selfexec: string;
  min_number_of_workers: number;
  max_number_of_workers: number;
  min_cpu_limit: number;
  max_cpu_limit: number;
  min_memory_limit: number;
  max_memory_limit: number;
  min_gpu_limit: number;
  max_gpu_limit: number;
}

export interface NodeInfo {
  piping_id: number;
  previous_piping_id: number | null;
  compute_resource_name: string;
  title: string;
}

export interface PipelineDefaultParameters {
  id: number;
  param_id: number;
  param_name: string;
  plugin_id: number;
  plugin_name: string;
  plugin_piping_id: number;
  plugin_piping_title: string;
  plugin_version: string;
  previous_plugin_piping_id: number | null;
  type: string;
  value: any;
}
