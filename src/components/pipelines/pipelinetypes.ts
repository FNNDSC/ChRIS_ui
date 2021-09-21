export interface PipelineCardProps {
  Pipeline_name: string;
  Description: string;
  Author: string;
  Date_created: string;
  Pipeline_id: number;
}

export interface PipelineSearchResponse {
  url: string;
  id: number;
  name: string;
  locked: boolean;
  authors: string;
  category: string;
  description: string;
  owner_username: string;
  creation_date: string;
  modification_date: string;
  plugins: string;
  plugin_pipings: string;
  default_parameters: string;
  instances: string;
}

export interface pluginTree {
  plugin_name: string;
  plugin_version: string;
  previous_index: any;
}

export interface RawNodeDatum {
  // id:number;
  name: string;
  children: RawNodeDatum[];
  parent?: number;
  __rd3t?: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

export interface PipelinePluginInstance {
  id: number;
  pipeline: string;
  pipeline_id: number;
  plugin: string;
  plugin_id: number;
  previous: string |null;
  previous_id?: number;
  url: string;
}
