import type { ComputeResource } from "@fnndsc/chrisapi";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  ErrorState,
  InstalledState,
  LoadingState,
  NotInstalledState,
} from "./InstallSubComponents";
import type { Plugin } from "./utils/types";
import { useAppSelector } from "../../store/hooks";

interface InstallationComponentProps {
  plugin: Plugin;
  selectedComputeResourcesList: ComputeResource[];
  onInstall?: (plugin: Plugin, resources: ComputeResource[]) => Promise<void>;
  onModifyResource?: (
    realPlugin: { name: string; version: string; url?: string },
    resources: ComputeResource[],
  ) => void;

  installed: boolean;
  installedComputeResources: ComputeResource[];
  isLoading: boolean;
  isError: boolean;
  pluginData?: {
    name: string;
    version: string;
    url?: string;
  };
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  selectedComputeResourcesList,
  onInstall,
  onModifyResource,
  installed,
  installedComputeResources,
  isLoading,
  isError,
  pluginData,
}) => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const queryClient = useQueryClient();
  const [installing, setInstalling] = useState(false);

  const anyMissing = useMemo(() => {
    if (!installed) return false;
    return !resourcesAreEqual(
      installedComputeResources,
      selectedComputeResourcesList,
    );
  }, [selectedComputeResourcesList, installedComputeResources, installed]);

  const handlePluginInstall = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (!onInstall || selectedComputeResourcesList.length === 0) {
      return;
    }
    setInstalling(true);
    try {
      await onInstall(plugin, selectedComputeResourcesList);
      queryClient.invalidateQueries({
        queryKey: ["pluginInstallationStatus", plugin.name, plugin.version],
      });
    } finally {
      setInstalling(false);
    }
  };
  const handleAddResource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!pluginData) return;
    e.stopPropagation();
    setInstalling(true);
    try {
      onModifyResource?.(pluginData, selectedComputeResourcesList);
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

  return (
    <InstalledState
      isLoggedIn={isLoggedIn}
      installedComputeResources={installedComputeResources}
      isInstalledOnSelectedResource={!anyMissing}
      onAddResource={
        anyMissing && onModifyResource && pluginData
          ? handleAddResource
          : undefined
      }
      installing={installing}
      resourceNames={selectedComputeResourcesList
        .map((cr) => cr.data.name)
        .join(", ")}
    />
  );
};

function resourcesAreEqual(arrA: ComputeResource[], arrB: ComputeResource[]) {
  if (arrA.length !== arrB.length) return false;
  const setA = new Set(arrA.map((r) => r.data.id));
  for (const item of arrB) {
    if (!setA.has(item.data.id)) return false;
  }
  return true;
}
