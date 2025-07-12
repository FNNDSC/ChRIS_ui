/**
 * @file updateComputeResource.ts
 * @author ChRIS UI Team
 * @description Utility function for updating plugin compute resources
 */

import axios from "axios";

/**
 * Updates compute resources for a plugin in the ChRIS store
 *
 * @param {string} pluginName - Plugin name
 * @param {string} version - Plugin version
 * @param {string[]} resourceNames - Array of compute resource names
 * @param {string} authHeader - Authentication header
 * @param {string} storeUrl - URL of the ChRIS store
 * @returns {Promise<any>} API response
 */
const postModifyComputeResource = async (
  pluginName: string,
  version: string,
  resourceNames: string[],
  authHeader: string,
  storeUrl: string,
): Promise<any> => {
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );

  if (!adminURL) {
    throw new Error("Please provide a link to your chris-admin URL.");
  }

  const computeResourceList = resourceNames.join(",");

  const pluginData = {
    compute_names: computeResourceList,
    name: pluginName,
    version: version,
    plugin_store_url: storeUrl,
  };

  const response = await axios.post(adminURL, pluginData, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export default postModifyComputeResource;
