import { Card, CardBody } from "@patternfly/react-core";
import { format } from "date-fns";
import type React from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { VersionSelect } from "./VersionSelect";
import ComputeResourceSelect from "./ComputeResourceSelect";
import { InstallationComponent } from "./InstallationComponent";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { Plugin } from "./utils/types";
import type { ComputeResource, Plugin as ChrisPlugin } from "@fnndsc/chrisapi";

async function checkInstallation(
  name: string,
  version: string,
  isLoggedIn?: boolean,
) {
  const client = ChrisAPIClient.getClient();
  const response = await client.getPlugins({ name, version });
  if (!response.data || !response.data.length) {
    return { installed: false, computeResources: [] };
  }

  const items = response.getItems() as ChrisPlugin[];
  const realPlugin = items[0];
  const realPluginName = realPlugin.data.name;
  const realPluginVersion = realPlugin.data.version;
  const realPluginURL = realPlugin.url;

  if (!isLoggedIn) {
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

  const crResultList = await realPlugin.getPluginComputeResources();
  const crResult = crResultList.getItems() || [];
  return {
    installed: true,
    computeResources: crResult,
    realPluginData: {
      name: realPluginName,
      version: realPluginVersion,
      url: realPluginURL,
    },
  };
}

interface PluginCardProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  setVersionMap: React.Dispatch<React.SetStateAction<Record<string, Plugin>>>;
  onInstall?: (plugin: Plugin, resources: ComputeResource[]) => Promise<void>;
  onSelect: (plugin: Plugin) => void;
  isSelected: boolean;
  computeResourceOptions?: ComputeResource[];
  isLoggedIn?: boolean;
  onModifyResource?: (
    realPlugin: { name: string; version: string; url?: string },
    resources: ComputeResource[],
  ) => void;
  selectedComputeResources: {
    [id: string]: ComputeResource[];
  };
  onComputeResourceChange: (
    pluginId: number,
    resources: ComputeResource[],
  ) => void;
}

export const PluginCard: React.FC<PluginCardProps> = (props) => {
  const {
    plugin,
    versionMap,
    setVersionMap,
    onInstall,
    onSelect,
    isSelected,
    computeResourceOptions,
    isLoggedIn,
    onModifyResource,
    selectedComputeResources,
    onComputeResourceChange,
  } = props;

  const selectedVersionPlugin = versionMap[plugin.name] || plugin;

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "pluginInstallationStatus",
      selectedVersionPlugin.name,
      selectedVersionPlugin.version,
      isLoggedIn,
    ],
    queryFn: () =>
      checkInstallation(
        selectedVersionPlugin.name,
        selectedVersionPlugin.version,
        isLoggedIn,
      ),
  });

  useEffect(() => {
    if (!data) return;

    const { installed, computeResources } = data;

    // If no selection has been made, set defaults based on installation status
    const noCurrentSelection =
      !selectedComputeResources[selectedVersionPlugin.id]?.length;

    if (noCurrentSelection) {
      if (installed && computeResources.length > 0) {
        onComputeResourceChange(selectedVersionPlugin.id, computeResources);
      } else if (!installed && computeResourceOptions?.[0]) {
        onComputeResourceChange(selectedVersionPlugin.id, [
          computeResourceOptions[0],
        ]);
      }
    }
  }, [
    data,
    selectedComputeResources,
    computeResourceOptions,
    selectedVersionPlugin.id,
    onComputeResourceChange,
  ]);

  const selectedList = selectedComputeResources[selectedVersionPlugin.id] || [];

  const handleCardClick = () => {
    if (isLoggedIn) {
      onSelect(selectedVersionPlugin);
    }
  };

  return (
    <Card
      isSelectable={isLoggedIn}
      isSelected={isLoggedIn && isSelected}
      onClick={handleCardClick}
      style={{ marginBottom: "1rem" }}
    >
      <CardBody
        style={{
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>
          <p style={{ fontSize: "0.9em", fontWeight: "bold" }}>
            {selectedVersionPlugin.name}
          </p>
          <div>{selectedVersionPlugin.title}</div>
          <div>{selectedVersionPlugin.authors}</div>
          <p style={{ fontSize: "0.90rem" }}>
            {format(
              new Date(selectedVersionPlugin.creation_date),
              "do MMMM, yyyy",
            )}
          </p>
          {isLoggedIn && computeResourceOptions && (
            <div
              style={{
                display: "flex",
                gap: "1em",
                marginTop: "1em",
                flexWrap: "wrap",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <p>Version</p>
                <VersionSelect
                  handlePluginVersion={(newSelected) => {
                    setVersionMap((prev) => ({
                      ...prev,
                      [selectedVersionPlugin.name]: newSelected,
                    }));
                  }}
                  currentVersion={selectedVersionPlugin.version}
                  plugins={plugin.pluginsList || []}
                />
              </div>
              <div>
                <p>Compute Resources</p>
                <ComputeResourceSelect
                  resourceOptions={computeResourceOptions}
                  selectedList={selectedList}
                  onChange={(computeResource) => {
                    onComputeResourceChange(
                      selectedVersionPlugin.id,
                      computeResource,
                    );
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <InstallationComponent
            plugin={selectedVersionPlugin}
            selectedComputeResourcesList={selectedList}
            onInstall={onInstall}
            onModifyResource={onModifyResource}
            installed={data?.installed || false}
            installedComputeResources={data?.computeResources || []}
            isLoading={isLoading}
            isError={isError}
            pluginData={data?.realPluginData}
          />
        </div>
      </CardBody>
    </Card>
  );
};
