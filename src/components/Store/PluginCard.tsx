// PluginCard.tsx
import type React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { format } from "date-fns";
import { VersionSelect } from "./VersionSelect";
import { InstallationComponent } from "./InstallationComponent";
import type { Plugin } from "./utils/types";

interface PluginCardProps {
  plugin: Plugin;
  versionMap: Record<string, Plugin>;
  setVersionMap: React.Dispatch<React.SetStateAction<Record<string, Plugin>>>;
  /**
   * Parent-provided handler for initiating an install
   */
  onInstall: (plugin: Plugin) => Promise<void>;
}

export const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  versionMap,
  setVersionMap,
  onInstall,
}) => {
  return (
    <Card className="plugin-item-card">
      <CardBody className="plugin-item-card-body">
        <p style={{ fontSize: "0.9em", fontWeight: "bold" }}>{plugin.name}</p>
        <div className="plugin-item-name">{plugin.title}</div>
        <div className="plugin-item-author">{plugin.authors}</div>
        <p style={{ fontSize: "0.90rem" }}>
          {format(new Date(plugin.creation_date), "do MMMM, yyyy")}
        </p>
        {/* Version Select */}
        <div style={{ fontSize: "0.90rem", marginTop: "1em" }}>
          Version:{" "}
          <VersionSelect
            handlePluginVersion={(selectedPlugin: Plugin) => {
              setVersionMap((prev) => ({
                ...prev,
                [plugin.name]: selectedPlugin,
              }));
            }}
            currentVersion={versionMap[plugin.name]?.version || plugin.version}
            plugins={plugin.pluginsList || []}
          />
        </div>

        <InstallationComponent
          plugin={plugin}
          versionMap={versionMap}
          // Instead of opening a modal directly, call the parent's onInstall
          onInstall={onInstall}
        />
      </CardBody>
    </Card>
  );
};
