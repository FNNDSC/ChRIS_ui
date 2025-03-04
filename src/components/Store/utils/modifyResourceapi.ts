// modifyComputeResourceAPI.ts
import axios from "axios";
import type { ComputeResource } from "@fnndsc/chrisapi";

/**
 * If you're now passing the real plugin data directly from the
 * InstallationComponent, you can drop the internal CUBE fetch logic
 * for name+version. We just do the "admin" POST here.
 */

interface RealPluginData {
  name: string;
  version: string;
  url?: string;
}

interface ModifyResourceArgs {
  adminCred: string;
  realPlugin: RealPluginData;
  newComputeResource: ComputeResource;
}

export async function modifyComputeResourceAPI({
  adminCred,
  realPlugin,
  newComputeResource,
}: ModifyResourceArgs) {
  // Use your environment variable for the admin endpoint:
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );

  if (!adminURL) {
    throw new Error("Please provide a valid chris-admin URL.");
  }

  // The name of the new compute resource we want to add/update
  const computeResourceName = newComputeResource.data.name;

  // The plugin data structure, similar to your handleInstallPlugin logic
  const pluginData = {
    compute_names: computeResourceName,
    name: realPlugin.name,
    version: realPlugin.version,
    plugin_store_url: realPlugin.url,
  };

  try {
    // POST to adminURL with the updated resource assignment
    const response = await axios.post(adminURL, pluginData, {
      headers: {
        Authorization: adminCred,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      const msg = e.response.data;
      if (msg.detail) {
        throw new Error(msg.detail);
      }
      if (typeof msg === "object") {
        const firstKey = Object.keys(msg)[0];
        const firstErrMessage = msg[firstKey]?.[0] || "Unknown error";
        throw new Error(firstErrMessage);
      }
      throw new Error("An unexpected error occurred");
    }
    throw new Error("An unexpected error occurred");
  }
}
