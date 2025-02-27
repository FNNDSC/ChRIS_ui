import React from "react";
import { Button, Icon, Label, LabelGroup } from "@patternfly/react-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChrisAPIClient from "../../api/chrisapiclient";
import { CheckCircleIcon } from "../Icons";
import type { Plugin } from "./utils/types";
import type { Plugin as ChrisPlugin } from "@fnndsc/chrisapi";

// Example shape of what's returned by getPluginComputeResources():
interface ComputeResourceItem {
  compute_resource_identifier: string;
  [key: string]: any; // additional fields
}

async function checkInstallation(name: string, version: string) {
  // 1) Fetch the plugin by name/version
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });

  if (!response.data || !response.data.length) {
    return { installed: false, computeResources: [] };
  }

  // 2) Parse the plugin + fetch associated compute resources
  //    .getItems() => an array of ChrisPlugin objects
  const pluginItems = response.getItems() as ChrisPlugin[];
  const firstPluginObj = pluginItems[0];

  // 3) For that plugin, retrieve its compute resources
  const crResult = await firstPluginObj.getPluginComputeResources();
  const computeResourceList = crResult?.data || [];
  // e.g. [{ compute_resource_identifier: "host", ...}, ...]

  return {
    installed: true,
    computeResources: computeResourceList,
  };
}

interface InstallationComponentProps {
  plugin: Plugin; // The selected plugin version
  computeResource: string; // The user-chosen resource
  onInstall: (plugin: Plugin, computeResource: string) => Promise<void>;
}

export const InstallationComponent: React.FC<InstallationComponentProps> = ({
  plugin,
  computeResource,
  onInstall,
}) => {
  const queryClient = useQueryClient();
  const [installing, setInstalling] = React.useState(false);

  // 1) Query for the plugin’s installation status + compute resources
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pluginInstallationStatus", plugin.name, plugin.version],
    queryFn: () => checkInstallation(plugin.name, plugin.version),
  });

  // 2) If data exists, destructure it
  const installed = data?.installed || false;
  const computeResources = data?.computeResources || [];

  // 3) Install handler
  const handleInstall = async () => {
    setInstalling(true);
    try {
      // call parent's onInstall with chosen plugin + resource
      await onInstall(plugin, computeResource);
      // re-check status
      queryClient.invalidateQueries({
        queryKey: ["pluginInstallationStatus", plugin.name, plugin.version],
      });
    } finally {
      setInstalling(false);
    }
  };

  // 4) Only enable "Install" if we have a plugin version & a compute resource
  const canInstall = !!plugin.version && !!computeResource;

  // 5) Render conditions
  if (isLoading) {
    return <p>Checking installation status...</p>;
  }
  if (isError) {
    return (
      <div style={{ marginTop: "1em" }}>
        <p style={{ color: "red" }}>Error checking installation status</p>
        <Button
          variant="primary"
          onClick={handleInstall}
          isDisabled={!canInstall || installing}
        >
          {installing ? "Installing..." : "Install"}
        </Button>
      </div>
    );
  }

  if (installed) {
    // 6) Render a label for each compute resource
    return (
      <div style={{ marginTop: "1em", display: "flex", alignItems: "center" }}>
        <Icon style={{ marginRight: "0.5em" }} status="success">
          <CheckCircleIcon />
        </Icon>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "0.5em" }}>Installed on</span>
          <LabelGroup>
            {computeResources.map((rc: ComputeResourceItem) => (
              <Label variant="filled" key={rc.name} color="green">
                {rc.name}
              </Label>
            ))}
          </LabelGroup>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={handleInstall}
      isDisabled={!canInstall || installing}
      isLoading={installing}
      style={{ marginTop: "1em" }}
    >
      {installing ? "Installing..." : "Install"}
    </Button>
  );
};
