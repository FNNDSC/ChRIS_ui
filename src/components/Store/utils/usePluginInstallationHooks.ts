// hooks/usePluginInstallationHooks.ts
import { useCallback } from "react";
import { message } from "antd";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { Plugin, InstallArgs } from "./types";
import type { ComputeResource } from "@fnndsc/chrisapi";
import { handleInstallPlugin } from "../../PipelinesCopy/utils";

export function usePluginInstaller() {
  const queryClient = useQueryClient();

  const doInstall = async (args: InstallArgs) => {
    const { plugin, authorization, computeResource } = args;
    return handleInstallPlugin(authorization, plugin, computeResource);
  };

  const installPluginMutation = useMutation({
    mutationFn: doInstall,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          variables.plugin.name,
          variables.plugin.version,
        ],
      });

      if (!variables.skipMessage) {
        const resourceName = variables.computeResource.data.name;
        message.success(
          `Installed ${variables.plugin.name} on ${resourceName}.`,
        );
      }
    },
  });

  return installPluginMutation;
}

/**
 * useBulkInstaller:
 * Allows multi-plugin installs in sequence, updating progress if an onProgressUpdate
 * callback is provided.
 */
export function useBulkInstaller(
  installMutation: UseMutationResult<any, Error, InstallArgs>,
) {
  return useCallback(
    async (
      plugins: Plugin[],
      authorization: string,
      resource: ComputeResource,
      onProgressUpdate?: (pct: number) => void,
    ) => {
      const total = plugins.length;
      if (!total) return;

      let completedCount = 0;
      const promises = plugins.map((plugin) =>
        installMutation
          .mutateAsync({
            plugin,
            authorization,
            computeResource: resource,
            skipMessage: true,
          })
          .finally(() => {
            completedCount++;
            const pct = Math.round((completedCount / total) * 100);
            if (onProgressUpdate) {
              onProgressUpdate(pct);
            }
          })
          .catch(() => undefined),
      );

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
