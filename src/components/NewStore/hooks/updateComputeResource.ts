import type { ComputeResource, Plugin } from "@fnndsc/chrisapi";
import axios from "axios";

interface ModifyResourceArgs {
  adminCred: string;
  plugin: Plugin["data"];
  newComputeResource: ComputeResource[];
}

async function postModifyComputeResource({
  adminCred,
  plugin,
  newComputeResource,
}: ModifyResourceArgs) {
  const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
    "/api/v1/",
    "/chris-admin/api/v1/",
  );
  if (!adminURL) {
    throw new Error("Please provide a valid chris-admin URL.");
  }
  const computeResourceList = newComputeResource
    .map((r) => r.data.name)
    .join(",");
  const pluginData = {
    compute_names: computeResourceList,
    name: plugin.name,
    version: plugin.version,
    plugin_store_url: plugin.url,
  };
  const response = await axios.post(adminURL, pluginData, {
    headers: {
      Authorization: adminCred,
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

export default postModifyComputeResource;
