// InstallationComponent.tsx
import type React from "react";
import { Button, Icon } from "@patternfly/react-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { Plugin } from "./utils/types";
import { CheckCircleIcon } from "../Icons";

interface InstallationComponentProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  onInstall: (plugin: Plugin) => Promise<void>; // Make sure onInstall returns a Promise
}

async function checkIfInstalled(name: string, version: string) {
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });
  // Assuming response.data is an array of plugin matches
  return response.data && response.data.length > 0;
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  versionMap,
  onInstall,
}) => {
  const queryClient = useQueryClient();

  // Determine which version the user selected
  const selectedPlugin = versionMap[plugin.name] || plugin;

  // 1) useQuery checks if the selected plugin is installed
  const {
    data: isInstalled,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "pluginInstallationStatus",
      selectedPlugin.name,
      selectedPlugin.version,
    ],
    queryFn: () =>
      checkIfInstalled(selectedPlugin.name, selectedPlugin.version),
    // Optional: Stale time, cache time, etc. If you want to re-check frequently:
    // staleTime: 0, cacheTime: 0
  });

  // 2) Handler for install button
  const handleInstall = async () => {
    try {
      // onInstall does staff vs. non-staff logic + actual install call
      await onInstall(selectedPlugin);

      // Invalidate the query so we re-check the new status
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          selectedPlugin.name,
          selectedPlugin.version,
        ],
      });
    } catch (error) {
      console.error("Install failed:", error);
    }
  };

  // 3) Render logic
  if (isLoading) {
    return <p>Checking installation status...</p>;
  }

  if (isError) {
    // Show some fallback if needed
    return (
      <div>
        <p style={{ color: "red" }}>Error checking installation</p>
        <Button variant="primary" onClick={handleInstall}>
          Install
        </Button>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div
        style={{
          marginTop: "1em",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon style={{ marginRight: "0.5em" }} status="success">
          <CheckCircleIcon />
        </Icon>
        <div>Installed</div>
      </div>
    );
  }

  return (
    <Button variant="primary" onClick={handleInstall}>
      Install
    </Button>
  );
};
