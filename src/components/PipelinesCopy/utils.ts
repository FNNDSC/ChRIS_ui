import axios from "axios";
import type Client from "@fnndsc/chrisapi";
import type { Plugin, PluginMeta } from "@fnndsc/chrisapi";
import { fetchResource } from "../../api/common";

interface Params {
  limit: number;
  offset: number;
  name?: string;
  name_exact?: string;
}

const defaultParams = {
  limit: 20,
  offset: 0,
};

export const fetchPluginMetas = async (client: Client, params?: Params) => {
  const fn = client.getPluginMetas;
  const boundFn = fn.bind(client);

  try {
    const { resource: pluginMetas } = await fetchResource<PluginMeta>(
      params || defaultParams,
      boundFn,
    );
    return pluginMetas;
  } catch (e) {
    throw new Error("Failed to fetch plugin metas");
  }
};

export const fetchPluginForMeta = async (pluginMeta: PluginMeta) => {
  const fn = pluginMeta.getPlugins;
  const boundFn = fn.bind(pluginMeta);

  try {
    const { resource: plugins } = await fetchResource(defaultParams, boundFn);
    return plugins as Plugin[];
  } catch (e) {
    throw new Error("Failed to fetch the plugins assosciated with this meta");
  }
};

export const handleInstallPlugin = async (
  adminCred: string,
  pluginToInstall: Plugin,
) => {
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );
  if (!adminURL)
    throw new Error("Please provide a link to your chris-admin url");

  const pluginData = {
    compute_names: "host",
    name: pluginToInstall.data.name,
    version: pluginToInstall.data.version,
    plugin_store_url: pluginToInstall.url,
  };

  try {
    const response = await axios.post(adminURL, pluginData, {
      headers: {
        Authorization: adminCred,
        "Content-Type": "application/json",
      },
    });

    const data = await response.data;
    return data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const message = e.response?.data || e.message;
      return message;
    }
  }
};
