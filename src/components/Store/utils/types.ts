import type { Plugin as ApiPlugin, ComputeResource } from "@fnndsc/chrisapi";

export type Plugin = ApiPlugin["data"] & {
  pluginsList?: Plugin[];
};

export interface PluginsResponse {
  count: number;
  results: Plugin[];
}

export interface InstallArgs {
  plugin: Plugin;
  authorization: string;
  computeResource: ComputeResource[];
  skipMessage?: boolean;
}
