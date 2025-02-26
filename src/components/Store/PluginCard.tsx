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
            handlePluginVersion={(newSelected: Plugin) => {
              setVersionMap((prev) => ({
                ...prev,
                [plugin.name]: newSelected,
              }));
            }}
            currentVersion={versionMap[plugin.name]?.version || plugin.version}
            plugins={plugin.pluginsList || []}
          />
        </div>

        {/* Renders the installation UI */}
        <InstallationComponent
          plugin={plugin}
          versionMap={versionMap}
          onInstall={onInstall}
        />
      </CardBody>
    </Card>
  );
};
