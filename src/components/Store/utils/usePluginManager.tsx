// usePluginInstallManager.ts
import { useCallback } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { message } from "antd";
import axios from "axios";
import { handleInstallPlugin } from "../../PipelinesCopy/utils";
import type { Plugin } from "./types";
import type { ComputeResource } from "@fnndsc/chrisapi";

interface InstallArgs {
  plugin: Plugin;
  authorization: string;
  computeResource: ComputeResource[];
  skipMessage?: boolean;
}

interface RealPluginData {
  name: string;
  version: string;
  url?: string;
}

interface ModifyResourceArgs {
  adminCred: string;
  realPlugin: RealPluginData;
  newComputeResource: ComputeResource[];
}

async function installPluginAPI(args: InstallArgs) {
  const { plugin, authorization, computeResource } = args;
  return handleInstallPlugin(authorization, plugin, computeResource);
}

function useInstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: installPluginAPI,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          variables.plugin.name,
          variables.plugin.version,
        ],
      });
      if (!variables.skipMessage) {
        const resourceNames = variables.computeResource
          .map((r) => r.data.name)
          .join(", ");
        message.success(
          `Installed ${variables.plugin.name} on ${resourceNames}`,
        );
      }
    },
    onError: (err: any) => {
      message.error(err?.message || "Error installing plugin.");
    },
  });
}

function useBulkInstaller(
  installMutation: UseMutationResult<any, Error, InstallArgs>,
) {
  return useCallback(
    async (
      plugins: Plugin[],
      authorization: string,
      resourceMap: Record<number, ComputeResource[]>,
      defaultResource?: ComputeResource,
      onProgressUpdate?: (pct: number) => void,
    ) => {
      if (!plugins.length) return;
      let completedCount = 0;
      const total = plugins.length;
      const promises = plugins.map((plugin) => {
        const resources = resourceMap[plugin.id]?.length
          ? resourceMap[plugin.id]
          : defaultResource
            ? [defaultResource]
            : [];
        return installMutation
          .mutateAsync({
            plugin,
            authorization,
            computeResource: resources,
            skipMessage: true,
          })
          .finally(() => {
            completedCount++;
            const pct = Math.round((completedCount / total) * 100);
            onProgressUpdate?.(pct);
          })
          .catch(() => undefined);
      });
      await Promise.allSettled(promises);
      const successCount = completedCount;
      const failCount = total - successCount;
      if (failCount > 0) {
        message.info(
          `Bulk install complete: ${successCount} succeeded, ${failCount} failed.`,
        );
      } else {
        message.success(
          `Bulk install complete! All ${successCount} plugin(s) installed successfully.`,
        );
      }
    },
    [installMutation],
  );
}

async function postModifyComputeResource({
  adminCred,
  realPlugin,
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
    name: realPlugin.name,
    version: realPlugin.version,
    plugin_store_url: realPlugin.url,
  };
  const response = await axios.post(adminURL, pluginData, {
    headers: {
      Authorization: adminCred,
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

function useModifyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postModifyComputeResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pluginInstallationStatus"] });
      message.success("Compute resource updated successfully!");
    },
    onError: (err: any) => {
      message.error(err?.message || "Error updating compute resource.");
    },
  });
}

export function usePluginInstallManager() {
  const installPluginMutation = useInstallPlugin();
  const bulkInstall = useBulkInstaller(installPluginMutation);
  const modifyResourceMutation = useModifyResourceMutation();

  const installPlugin = useCallback(
    (plugin: Plugin, authorization: string, resources: ComputeResource[]) => {
      return installPluginMutation.mutate({
        plugin,
        authorization,
        computeResource: resources,
      });
    },
    [installPluginMutation],
  );

  const bulkInstallPlugins = useCallback(
    (
      plugins: Plugin[],
      authorization: string,
      resourceMap: Record<number, ComputeResource[]>,
      defaultResource?: ComputeResource,
      onProgress?: (pct: number) => void,
    ) => {
      return bulkInstall(
        plugins,
        authorization,
        resourceMap,
        defaultResource,
        onProgress,
      );
    },
    [bulkInstall],
  );

  const modifyComputeResources = useCallback(
    (
      realPlugin: RealPluginData,
      newComputeResource: ComputeResource[],
      adminCred: string,
    ) => {
      return modifyResourceMutation.mutate({
        adminCred,
        realPlugin,
        newComputeResource,
      });
    },
    [modifyResourceMutation],
  );

  return {
    installPluginMutation,
    modifyResourceMutation,
    installPlugin,
    bulkInstallPlugins,
    modifyComputeResources,
  };
}
