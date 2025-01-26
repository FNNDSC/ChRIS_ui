import type { PluginInstance } from "@fnndsc/chrisapi";
import { useQuery } from "@tanstack/react-query";
import { inflate, inflateRaw } from "pako";
import ChrisAPIClient from "../../api/chrisapiclient"; // or your client
import { getStatusLabels, type PluginStatusLabels } from "./utils";

// Reuse your getLog function
function getLog(raw: string) {
  // Step 1: Decode base64
  const strData = atob(raw);

  // Try "deflate"
  try {
    const inflatedData = inflate(strData, { to: "string" });
    return JSON.parse(inflatedData);
  } catch (error1) {
    console.error("Error inflating with deflate:", error1);

    // Try "zlib"
    try {
      const inflatedData = inflateRaw(strData, { to: "string" });
      return JSON.parse(inflatedData);
    } catch (error2) {
      console.error("Error inflating with zlib:", error2);
    }
  }
  console.error("Unable to inflate the data.");
  return null;
}

interface PluginInstanceResource {
  status: string | undefined;
  pluginStatus: any; // e.g. an array of step labels
  pluginLog: any; // e.g. parsed logs
  pluginDetails: any; // the raw data from the plugin instance
  previousStatus: string;
}

export function usePluginInstanceResourceQuery(instance?: PluginInstance) {
  const client = ChrisAPIClient.getClient();

  return useQuery<PluginInstanceResource | null, Error>({
    queryKey: ["pluginInstanceResource", instance?.data.id],
    queryFn: async () => {
      // Bail out if we don’t have an instance
      if (!instance) return null;

      // 1) Fetch current plugin instance details safely

      const pluginDetails = await instance.get();

      const status = pluginDetails.data.status;

      // 2) Parse pluginStatus JSON from `data.summary`
      let parsedStatus: PluginStatusLabels = {};
      const pluginStatusJson = pluginDetails.data.summary;
      if (pluginStatusJson) {
        parsedStatus = JSON.parse(pluginStatusJson) as PluginStatusLabels;
      }

      // 3) Parse logs from base64 "raw" field
      let output = {};
      const rawField = pluginDetails.data.raw;
      if (rawField && rawField.length > 0) {
        const parsedLog = getLog(rawField);
        if (parsedLog) {
          output = parsedLog;
        }
      }

      // 4) Fetch the previous instance’s status (if applicable)
      let previousStatus = "";
      const previousInstanceId = instance.data.previous_id;
      if (previousInstanceId) {
        try {
          const previousInstance =
            await client.getPluginInstance(previousInstanceId);
          if (previousInstance?.data?.status) {
            previousStatus = previousInstance.data.status;
          }
        } catch (err) {
          console.warn("Failed to fetch previous instance:", err);
        }
      }

      const pluginStatus = getStatusLabels(
        parsedStatus,
        pluginDetails,
        previousStatus,
      );

      return {
        status,
        pluginStatus,
        pluginLog: output,
        pluginDetails,
        previousStatus,
      };
    },
    enabled: !!instance,

    // In React Query v4, refetchInterval receives a QueryObserverResult
    refetchInterval: (result) => {
      const data = result.state.data;

      // Stop polling if the plugin is in a terminal state
      if (
        data?.status === "finishedWithError" ||
        data?.status === "cancelled" ||
        data?.status === "finishedSuccessfully"
      ) {
        return false;
      }

      // Otherwise, keep polling every 7 seconds
      return 7000;
    },
  });
}
