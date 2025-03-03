import type { PluginMeta, ComputeResource } from "@fnndsc/chrisapi";
import type Client from "@fnndsc/chrisapi";
import axios from "axios";
import { fetchResource } from "../../api/common";
import type { Plugin } from "../Store/utils/types";

type Params = {
  [key: string]: string | number;
};

/**
 * Fetches plugin metadata from the ChRIS store.
 * @param {Client} client - The ChRIS API client.
 * @param {Params} [params] - Query parameters for fetching plugin metadata.
 * @returns {Promise<PluginMeta[]>} - A promise that resolves to an array of plugin metadata.
 * @throws Will throw an error if fetching plugin metadata fails.
 */

export const fetchPluginMetas = async (client: Client, params?: Params) => {
  const fn = client.getPluginMetas;
  const boundFn = fn.bind(client);

  try {
    const { resource: pluginMetas } = await fetchResource<PluginMeta>(
      params || {
        limit: 20,
        offset: 0,
      },
      boundFn,
    );
    return pluginMetas;
  } catch (e) {
    throw new Error("Failed to fetch plugin metas");
  }
};

/**
 * Fetches plugins associated with a specific plugin metadata.
 * @param {PluginMeta} pluginMeta - The plugin metadata object.
 * @returns {Promise<Plugin[]>} - A promise that resolves to an array of plugins.
 * @throws Will throw an error if fetching plugins associated with the metadata fails.
 */
export const fetchPluginForMeta = async (pluginMeta: PluginMeta) => {
  const fn = pluginMeta.getPlugins;
  const boundFn = fn.bind(pluginMeta);
  const defaultParams = {
    limit: 20,
    offset: 0,
  };

  try {
    const { resource: plugins } = await fetchResource(defaultParams, boundFn);
    return plugins as Plugin[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(
      "Unhandled Error. Please reach out to @devbabymri.org to report this error",
    );
  }
};

/**
 * Uploads a pipeline source file to the ChRIS store.
 * @param {Client} client - The ChRIS API client.
 * @param {File} file - The file to upload.
 * @returns {Promise<void>} - A promise that resolves when the file is uploaded.
 * @throws Will throw an error if the file upload fails.
 */
export const uploadPipelineSourceFile = async (client: Client, file: File) => {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}pipelines/sourcefiles/`;
  const formData = new FormData();
  formData.append("fname", file, file.name);
  const config = {
    headers: { Authorization: `Token ${client.auth.token}` },
  };
  await axios.post(url, formData, config);
};

/**
 * Installs a plugin using admin credentials.
 * @param {string} adminCred - The admin credentials for authentication.
 * @param {Plugin} pluginToInstall - The plugin to be installed.
 * @returns {Promise<any>} - A promise that resolves with the installation response data.
 * @throws Will throw an error if the plugin installation fails.
 */
export const handleInstallPlugin = async (
  adminCred: string,
  pluginToInstall: Plugin,
  computeResource: ComputeResource,
) => {
  // Construct the chris-admin URL from your environment variable
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );

  if (!adminURL) {
    throw new Error("Please provide a link to your chris-admin URL.");
  }

  // Extract the name from the computeResource object
  const computeResourceName = computeResource.data.name;

  // Construct the body for the POST request
  const pluginData = {
    compute_names: computeResourceName,
    name: pluginToInstall.name,
    version: pluginToInstall.version,
    plugin_store_url: pluginToInstall.url,
  };

  try {
    const response = await axios.post(adminURL, pluginData, {
      headers: {
        Authorization: adminCred,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (e) {
    // Check if this is an Axios error with a response payload
    if (axios.isAxiosError(e) && e.response?.data) {
      const message = e.response.data;
      // Log the entire error for more detailed context
      if (message.detail) {
        // e.g. { detail: "Invalid Username/Password" }
        throw new Error(message.detail);
      }
      // If it's an object with keys => we assume the first key has the first error
      if (typeof message === "object") {
        const firstErrorKey = Object.keys(message)[0];
        const firstErrorMessage =
          message[firstErrorKey]?.[0] || "Unknown error";
        throw new Error(firstErrorMessage);
      }
      throw new Error("An unexpected error occurred");
    }
    throw new Error("An unexpected error occurred");
  }
};
/**
 * Fetches a specific plugin from the store by its name and version.
 * @param {Client} storeClient - The ChRIS store client.
 * @param {string} pluginMetaName - The name of the plugin metadata.
 * @param {string} pluginMetaVersion - The version of the plugin metadata.
 * @returns {Promise<Plugin>} - A promise that resolves to the selected plugin.
 * @throws Will throw an error if the plugin or its metadata is not found.
 */
export const fetchPluginMetasFromStore = async (
  storeClient: Client,
  pluginMetaName: string,
  pluginMetaVersion: string,
) => {
  const pluginMetas = await fetchPluginMetas(storeClient, {
    limit: 1,
    offset: 0,
    name_exact: pluginMetaName,
  });

  if (!pluginMetas || !pluginMetas.length) {
    throw new Error(`Failed to find ${pluginMetaName} in the store...`);
  }

  const pluginMeta = pluginMetas[0];
  const pluginList = await pluginMeta.getPlugins({ limit: 1000 });
  const plugins = pluginList.getItems();

  if (!plugins) {
    throw new Error(
      "Failed to fetch plugins associated with this plugin meta...",
    );
  }

  const selectedPlugin = plugins.find(
    (plugin: Plugin) => plugin.data.version === pluginMetaVersion,
  );
  if (!selectedPlugin) {
    throw new Error(
      `Failed to find the ${pluginMetaVersion} version of ${pluginMetaName} in the store`,
    );
  }
  return selectedPlugin;
};

// Function to extract plugin name and version from error message
export const extractPluginInfo = (
  errorMessage: string,
): { name: string; version: string } | null => {
  // Regular expression to match plugin name and version
  const regex = /Couldn't find any plugin with name (\S+) and version (\S+)./;
  const match = errorMessage.match(regex);

  if (match) {
    const [, name, version] = match;
    return { name, version };
  }

  return null;
};
