import type { Plugin as ChrisPlugin, ComputeResource } from "@fnndsc/chrisapi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useMemo, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import {
  ErrorState,
  InstalledState,
  LoadingState,
  NotInstalledState,
} from "./InstallSubComponents";
import type { Plugin } from "./utils/types";

async function checkInstallation(
  name: string,
  version: string,
  isLoggedIn?: boolean,
): Promise<{
  installed: boolean;
  computeResources: { id: number; name: string }[];
}> {
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });
  if (!response.data || !response.data.length) {
    return { installed: false, computeResources: [] };
  }
  if (!isLoggedIn) {
    return { installed: true, computeResources: [] };
  }
  const items = response.getItems() as ChrisPlugin[];
  const pluginObj = items[0];
  const crResult = await pluginObj.getPluginComputeResources();
  return {
    installed: true,
    computeResources: crResult?.data || [],
  };
}

async function modifyComputeResource(pluginId: number, resourceId: number) {
  // Replace with real logic as needed
  console.log(`Assigning plugin #${pluginId} to resource #${resourceId}`);
}

interface InstallationComponentProps {
  plugin: Plugin;
  computeResource?: ComputeResource;
  onInstall?: (plugin: Plugin, resource: ComputeResource) => Promise<void>;
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  computeResource,
  onInstall,
}) => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const queryClient = useQueryClient();
  const [installing, setInstalling] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "pluginInstallationStatus",
      plugin.name,
      plugin.version,
      isLoggedIn,
    ],
    queryFn: () => checkInstallation(plugin.name, plugin.version, isLoggedIn),
  });

  const installed = data?.installed || false;
  const computeResources = data?.computeResources || [];

  /**
   * For logged-out users or if no computeResource is passed,
   * we default to `false` for resource-level checks.
   */
  const isInstalledOnSelectedResource = useMemo(() => {
    if (!isLoggedIn || !computeResource) return false;
    return computeResources.some((rc) => rc.name === computeResource.data.name);
  }, [computeResources, computeResource, isLoggedIn]);

  const handlePluginInstall = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (!onInstall || !computeResource) {
      setInstalling(false);
      return;
    }
    setInstalling(true);
    try {
      await onInstall(plugin, computeResource);
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          plugin.name,
          plugin.version,
          isLoggedIn,
        ],
      });
    } finally {
      setInstalling(false);
    }
  };

  const handleAddResource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!computeResource) {
      setInstalling(false);
      return;
    }
    setInstalling(true);
    try {
      await modifyComputeResource(plugin.id, computeResource.data.id);
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          plugin.name,
          plugin.version,
          isLoggedIn,
        ],
      });
    } finally {
      setInstalling(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState pluginName={plugin.name} />;
  }

  if (!installed) {
    return (
      <NotInstalledState
        isLoggedIn={isLoggedIn}
        onInstall={onInstall ? handlePluginInstall : undefined}
        installing={installing}
      />
    );
  }

  /**
   * If installed globally, we handle resource-specific add actions
   * only if a computeResource is defined. We pass an empty string
   * if computeResource is undefined.
   */
  return (
    <InstalledState
      computeResources={computeResources}
      isLoggedIn={isLoggedIn}
      isInstalledOnSelectedResource={isInstalledOnSelectedResource}
      onAddResource={computeResource ? handleAddResource : undefined}
      installing={installing}
      resourceName={computeResource?.data.name || ""}
    />
  );
};
