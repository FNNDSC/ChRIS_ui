// utils/aggregatePlugins.ts
import type { Plugin } from "./types";

export const aggregatePlugins = (plugins: Plugin[]): Plugin[] => {
  const pluginMap: Record<string, Plugin> = {};

  plugins.forEach((plugin) => {
    const pluginName = plugin.name;
    if (!pluginMap[pluginName]) {
      pluginMap[pluginName] = { ...plugin, pluginsList: [] };
    } else {
      pluginMap[pluginName].pluginsList?.push(plugin);
    }
  });

  return Object.values(pluginMap);
};
