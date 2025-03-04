import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { format } from "date-fns";
import { VersionSelect } from "./VersionSelect";
import { InstallationComponent } from "./InstallationComponent";
import ComputeResourceSelect from "./ComputeResourceSelect";
import type { Plugin } from "./utils/types";
import type { ComputeResource } from "@fnndsc/chrisapi";

interface PluginCardProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  setVersionMap: React.Dispatch<React.SetStateAction<Record<string, Plugin>>>;
  onInstall?: (plugin: Plugin, resource: ComputeResource) => Promise<void>;
  onSelect: (plugin: Plugin) => void;
  isSelected: boolean;
  computeResourceOptions?: ComputeResource[];
  isLoggedIn?: boolean;
  /**
   * We'll accept the real plugin data in the child's callback:
   * onModifyResource: (realPlugin: { name: string, version: string, url?: string }, resource: ComputeResource) => void
   */
  onModifyResource?: (
    realPlugin: { name: string; version: string; url?: string },
    resource: ComputeResource,
  ) => void;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  versionMap,
  setVersionMap,
  onInstall,
  onSelect,
  isSelected,
  computeResourceOptions,
  isLoggedIn,
  onModifyResource,
}) => {
  const selectedVersionPlugin = versionMap[plugin.name] || plugin;
  const [selectedComputeResource, setSelectedComputeResource] =
    useState<ComputeResource>();

  useEffect(() => {
    if (!selectedComputeResource && computeResourceOptions?.[0]) {
      setSelectedComputeResource(computeResourceOptions[0]);
    }
  }, [computeResourceOptions, selectedComputeResource]);

  const handleCardClick = () => {
    if (isLoggedIn) {
      onSelect(plugin);
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
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: "0.9em", fontWeight: "bold" }}>{plugin.name}</p>
          <div>{plugin.title}</div>
          <div>{plugin.authors}</div>
          <p style={{ fontSize: "0.90rem" }}>
            {format(new Date(plugin.creation_date), "do MMMM, yyyy")}
          </p>
          {isLoggedIn && computeResourceOptions && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1em",
              }}
            >
              <div>
                <p style={{ margin: 0 }}>Version:</p>
                <VersionSelect
                  handlePluginVersion={(newSelected) => {
                    setVersionMap((prev) => ({
                      ...prev,
                      [plugin.name]: newSelected,
                    }));
                  }}
                  currentVersion={selectedVersionPlugin.version}
                  plugins={plugin.pluginsList || []}
                />
              </div>
              <div>
                <p style={{ margin: 0 }}>Compute Resource:</p>
                <ComputeResourceSelect
                  resourceOptions={computeResourceOptions}
                  selected={selectedComputeResource}
                  onChange={setSelectedComputeResource}
                />
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <InstallationComponent
            plugin={selectedVersionPlugin}
            computeResource={selectedComputeResource}
            onInstall={onInstall}
            onModifyResource={onModifyResource}
          />
        </div>
      </CardBody>
    </Card>
  );
};
