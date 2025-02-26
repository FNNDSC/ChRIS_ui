import React from "react";
import { Button, Icon } from "@patternfly/react-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { CheckCircleIcon } from "../Icons";
import type { Plugin } from "./utils/types";

interface InstallationComponentProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  onInstall: (plugin: Plugin) => Promise<void>; // The parent's staff vs non-staff logic
}

async function checkIfInstalled(name: string, version: string) {
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });
  // Adjust based on your actual API response
  return response.data && response.data.length > 0;
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  versionMap,
  onInstall,
}) => {
  const queryClient = useQueryClient();
  const [installing, setInstalling] = React.useState(false);

  // Determine which version user selected
  const selectedPlugin = versionMap[plugin.name] || plugin;

  // Check if selected plugin is installed
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
  });

  // Handler for "Install" button
  const handleInstall = async () => {
    setInstalling(true);
    try {
      await onInstall(selectedPlugin);
      // If onInstall resolves, re-check installation status
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          selectedPlugin.name,
          selectedPlugin.version,
        ],
      });
    } catch (error) {
      // If onInstall rejects (non-staff or actual error), do nothing or handle error
      console.error("Install call rejected or failed:", error);
    } finally {
      setInstalling(false);
    }
  };

  // 1) If we are checking the status, show "Checking..."
  if (isLoading) {
    return <p>Checking installation status...</p>;
  }

  // 2) If the query errored out
  if (isError) {
    return (
      <div style={{ marginTop: "1em" }}>
        <p style={{ color: "red" }}>Error checking installation status</p>
        <Button
          variant="primary"
          onClick={handleInstall}
          isDisabled={installing}
        >
          {installing ? "Installing..." : "Install"}
        </Button>
      </div>
    );
  }

  // 3) If plugin is already installed
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

  // 4) Otherwise, user can install
  return (
    <Button
      style={{ marginTop: "1em" }}
      variant="primary"
      onClick={handleInstall}
      isDisabled={installing}
      isLoading={installing}
    >
      {installing ? "Installing..." : "Install"}
    </Button>
  );
};
