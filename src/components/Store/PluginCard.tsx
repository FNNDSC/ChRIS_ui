import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { format } from "date-fns";
import { VersionSelect } from "./VersionSelect";
import { InstallationComponent } from "./InstallationComponent";
import ComputeResourceSelect from "./ComputeResourceSelect";
import type { Plugin } from "./utils/types";

interface PluginCardProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  setVersionMap: React.Dispatch<React.SetStateAction<Record<string, Plugin>>>;
  onInstall: (plugin: Plugin, computeResource: string) => Promise<void>;
  onSelect: (plugin: Plugin) => void;
  isSelected: boolean;
  computeResourceOptions?: string[]; // can be empty initially
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  versionMap,
  setVersionMap,
  onInstall,
  onSelect,
  isSelected,
  computeResourceOptions,
}) => {
  // 1) The selected version from "versionMap" or fallback to the plugin itself
  const selectedVersionPlugin = versionMap[plugin.name] || plugin;

  // 2) Keep local state for compute resource
  const [selectedComputeResource, setSelectedComputeResource] =
    React.useState("");

  // If or when computeResourceOptions becomes non-empty, auto-select the first if none is chosen
  React.useEffect(() => {
    if (
      !selectedComputeResource &&
      computeResourceOptions &&
      computeResourceOptions.length > 0
    ) {
      setSelectedComputeResource(computeResourceOptions[0]);
    }
  }, [computeResourceOptions, selectedComputeResource]);

  return (
    <Card
      className="plugin-item-card"
      isSelectable
      isSelected={isSelected}
      onClick={() => onSelect(plugin)}
      style={{ marginBottom: "1rem" }}
    >
      <CardBody className="plugin-item-card-body">
        {/* Plugin Info */}
        <p style={{ fontSize: "0.9em", fontWeight: "bold" }}>{plugin.name}</p>
        <div className="plugin-item-name">{plugin.title}</div>
        <div className="plugin-item-author">{plugin.authors}</div>
        <p style={{ fontSize: "0.90rem" }}>
          {format(new Date(plugin.creation_date), "do MMMM, yyyy")}
        </p>

        {/* Side-by-side: Version + Compute Resource */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1em",
          }}
        >
          {/* Version Selection */}
          <div>
            <p style={{ margin: 0 }}>Version:</p>
            <VersionSelect
              handlePluginVersion={(newSelected: Plugin) => {
                setVersionMap((prev) => ({
                  ...prev,
                  [plugin.name]: newSelected,
                }));
              }}
              currentVersion={selectedVersionPlugin.version}
              plugins={plugin.pluginsList || []}
            />
          </div>

          {/* Compute Resource Selection */}
          <div>
            <p style={{ margin: 0 }}>Compute Resource:</p>
            <ComputeResourceSelect
              resourceOptions={computeResourceOptions || []}
              selected={selectedComputeResource}
              onChange={setSelectedComputeResource}
            />
          </div>
        </div>

        {/* The "Install" / "Installed on X" logic */}
        <InstallationComponent
          plugin={selectedVersionPlugin}
          computeResource={selectedComputeResource}
          onInstall={onInstall}
        />
      </CardBody>
    </Card>
  );
};
