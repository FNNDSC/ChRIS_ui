import type { Plugin as ApiPlugin } from "@fnndsc/chrisapi";

export type Plugin = ApiPlugin["data"] & {
  pluginsList?: Plugin[];
};

export interface PluginsResponse {
  count: number;
  results: Plugin[];
}
