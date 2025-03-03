import { Button, Icon, Label, LabelGroup } from "@patternfly/react-core";
import type React from "react";
import { CheckCircleIcon } from "../Icons";

export const LoadingState: React.FC = () => (
  <div style={{ minHeight: "5rem", display: "flex", alignItems: "center" }}>
    Checking plugin installation status...
  </div>
);

interface ErrorStateProps {
  pluginName: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ pluginName }) => (
  <div style={{ minHeight: "5rem", display: "flex", flexDirection: "column" }}>
    <p style={{ color: "red" }}>Error checking plugin installation status</p>
    <p style={{ color: "gray" }}>
      Unable to determine if <strong>{pluginName}</strong> is installed.
    </p>
  </div>
);

interface NotInstalledStateProps {
  pluginName: string;
  isLoggedIn?: boolean;
  onInstall?: () => void;
  installing: boolean;
}

export const NotInstalledState: React.FC<NotInstalledStateProps> = ({
  isLoggedIn,
  onInstall,
  installing,
}) => (
  <div style={{ minHeight: "5rem", display: "flex", alignItems: "center" }}>
    {!isLoggedIn && (
      <p style={{ marginLeft: "1rem", color: "gray" }}>
        Please log in to install plugins.
      </p>
    )}
    {isLoggedIn && onInstall && (
      <Button
        variant="primary"
        onClick={onInstall}
        isDisabled={installing}
        isLoading={installing}
      >
        {installing ? "Installing..." : "Install"}
      </Button>
    )}
  </div>
);

interface InstalledStateProps {
  pluginName: string;
  computeResources: { id: number; name: string }[];
  isLoggedIn?: boolean;
  isInstalledOnSelectedResource: boolean;
  onAddResource?: () => void;
  installing: boolean;
  resourceName: string;
}

export const InstalledState: React.FC<InstalledStateProps> = ({
  computeResources,
  isLoggedIn,
  isInstalledOnSelectedResource,
  onAddResource,
  installing,
  resourceName,
}) => (
  <div style={{ minHeight: "5rem", display: "flex", flexDirection: "column" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
      }}
    >
      <Icon status="success" style={{ marginRight: "0.5rem" }}>
        <CheckCircleIcon />
      </Icon>
      <span style={{ marginRight: "0.5rem" }}>Installed on:</span>
      {isLoggedIn ? (
        <LabelGroup>
          {computeResources.map((rc) => (
            <Label variant="filled" key={rc.id} color="green">
              {rc.name}
            </Label>
          ))}
        </LabelGroup>
      ) : (
        <span style={{ color: "gray" }}>Login to view compute resources</span>
      )}
    </div>
    {!isInstalledOnSelectedResource && isLoggedIn && onAddResource && (
      <Button
        variant="secondary"
        onClick={onAddResource}
        isDisabled={installing}
        isLoading={installing}
        style={{ width: "auto" }}
      >
        Install on {resourceName}
      </Button>
    )}
  </div>
);
