import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../../store/hooks";
import type { Plugin as ChrisPlugin, ComputeResource } from "@fnndsc/chrisapi";
import type { Plugin } from "./utils/types";
import {
  ErrorState,
  InstalledState,
  LoadingState,
  NotInstalledState,
} from "./InstallSubComponents";
import ChrisAPIClient from "../../api/chrisapiclient";

// Enhanced "checkInstallation" returns the real plugin's data
async function checkInstallation(
  name: string,
  version: string,
  isLoggedIn?: boolean,
): Promise<{
  installed: boolean;
  computeResources: { id: number; name: string }[];
  realPluginData?: {
    name: string;
    version: string;
    url?: string; // Or any other fields you want from the real plugin
  };
}> {
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });
  if (!response.data || !response.data.length) {
    return { installed: false, computeResources: [] };
  }
  // If plugin is found, store some relevant fields from CUBE
  const items = response.getItems() as ChrisPlugin[];
  const realPlugin = items[0];

  // You can read realPlugin.data for additional properties
  const realPluginName = realPlugin.data.name;
  const realPluginVersion = realPlugin.data.version;
  const realPluginURL = realPlugin.url;

  if (!isLoggedIn) {
    // Return basic info if not logged in
    return {
      installed: true,
      computeResources: [],
      realPluginData: {
        name: realPluginName,
        version: realPluginVersion,
        url: realPluginURL,
      },
    };
  }
  const crResult = await realPlugin.getPluginComputeResources();
  return {
    installed: true,
    computeResources: crResult?.data || [],
    realPluginData: {
      name: realPluginName,
      version: realPluginVersion,
      url: realPluginURL,
    },
  };
}

interface InstallationComponentProps {
  /**
   * This "plugin" is from the store, but we won't rely on its
   * store-based ID. We'll fetch the real plugin from CUBE in checkInstallation
   * and store that info in state if installed.
   */
  plugin: Plugin;
  computeResource?: ComputeResource;
  onInstall?: (plugin: Plugin, resource: ComputeResource) => Promise<void>;
  /**
   * We'll pass real plugin info (name, version, url) + computeResource to this callback
   * The parent can handle the admin update.
   */
  onModifyResource?: (
    realPlugin: { name: string; version: string; url?: string },
    computeResource: ComputeResource,
  ) => void;
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  computeResource,
  onInstall,
  onModifyResource,
}) => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const queryClient = useQueryClient();
  const [installing, setInstalling] = useState(false);

  // 1) Query for whether the plugin is installed in CUBE, plus real plugin data
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

  // 2) If installed, we have "realPluginData" from the server
  const realPluginData = data?.realPluginData;

  const isInstalledOnSelectedResource = useMemo(() => {
    if (!isLoggedIn || !computeResource) return false;
    return computeResources.some((rc) => rc.name === computeResource.data.name);
  }, [computeResources, computeResource, isLoggedIn]);

  // 3) "Install" callback
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

  // 4) "Add resource" callback => call parent's onModifyResource with real plugin data
  const handleAddResource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!computeResource || !onModifyResource) {
      setInstalling(false);
      return;
    }
    setInstalling(true);
    try {
      /**
       * Because we already have the real plugin info from checkInstallation,
       * we can pass that directly. No additional fetch needed!
       */
      if (!realPluginData) {
        throw new Error(
          "Real plugin data not found. Are we sure it's installed?",
        );
      }
      onModifyResource(realPluginData, computeResource);
    } finally {
      setInstalling(false);
    }
  };

  // 5) Render states
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

  return (
    <InstalledState
      computeResources={computeResources}
      isLoggedIn={isLoggedIn}
      isInstalledOnSelectedResource={isInstalledOnSelectedResource}
      onAddResource={
        computeResource && onModifyResource ? handleAddResource : undefined
      }
      installing={installing}
      resourceName={computeResource?.data.name || ""}
    />
  );
};
