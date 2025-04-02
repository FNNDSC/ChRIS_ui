import type React from "react";
import { Button, Icon, Label, LabelGroup } from "@patternfly/react-core";
import { CheckCircleIcon } from "../Icons";
import type { ComputeResource } from "@fnndsc/chrisapi";

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
  isLoggedIn?: boolean;
  onInstall?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  installing: boolean;
}
export const NotInstalledState: React.FC<NotInstalledStateProps> = ({
  isLoggedIn,
  onInstall,
  installing,
}) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {!isLoggedIn && (
      <p style={{ color: "gray" }}>Please log in to install this plugin</p>
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
  installedComputeResources: ComputeResource[];
  isLoggedIn?: boolean;
  isInstalledOnSelectedResource: boolean;
  onAddResource?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  installing: boolean;
  resourceNames: string;
}

export const InstalledState: React.FC<InstalledStateProps> = ({
  installedComputeResources,
  isLoggedIn,
  isInstalledOnSelectedResource,
  onAddResource,
  installing,
  resourceNames,
}) => (
  <div style={{ minHeight: "5rem" }}>
    {isLoggedIn ? (
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
        <span style={{ marginRight: "0.5rem" }}>Plugin is installed on:</span>
        <LabelGroup>
          {installedComputeResources.map((rc) => (
            <Label variant="filled" key={rc.data.id} color="green">
              {rc.data.name}
            </Label>
          ))}
        </LabelGroup>
      </div>
    ) : (
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
        <span style={{ marginRight: "0.5rem" }}>Plugin is installed</span>
      </div>
    )}

    {/* The currently selected compute resource is not installed */}
    {!isInstalledOnSelectedResource && isLoggedIn && onAddResource && (
      <Button
        variant="primary"
        onClick={onAddResource}
        isDisabled={installing}
        isLoading={installing}
      >
        Install on {resourceNames}
      </Button>
    )}
  </div>
);
