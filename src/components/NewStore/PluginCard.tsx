// PluginCard.tsx
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Select,
  SelectOption,
  Button,
  Spinner,
  MenuToggle,
  Label,
  Icon,
  type MenuToggleElement,
} from "@patternfly/react-core";
import type { StorePlugin } from "./hooks/useFetchPlugins";
import type { ComputeResource } from "@fnndsc/chrisapi";
import { format } from "date-fns";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { Plugin as ChrisPlugin } from "@fnndsc/chrisapi";
import { useAppSelector } from "../../store/hooks";
import { CheckCircleIcon } from "../Icons";

async function checkInstallation(
  name: string,
  version: string,
  isLoggedIn?: boolean,
): Promise<{ installed: boolean; computeResources: ComputeResource[] }> {
  const client = ChrisAPIClient.getClient();
  const resp = await client.getPlugins({ name, version });
  if (!resp.data?.length) {
    return { installed: false, computeResources: [] };
  }
  const realItems = resp.getItems() as ChrisPlugin[];
  const real = realItems[0];
  if (!isLoggedIn) {
    return { installed: true, computeResources: [] };
  }
  const crList = await real.getPluginComputeResources();
  const crItems = crList.getItems() || [];
  return { installed: true, computeResources: crItems as ComputeResource[] };
}

interface PluginCardProps {
  basePlugin: StorePlugin;
  computeList?: ComputeResource[];
  onInstall?: (
    plugin: StorePlugin,
    computeResources: ComputeResource[],
  ) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({
  basePlugin,
  computeList = [],
  onInstall,
}) => {
  const { isLoggedIn } = useAppSelector((state) => state.user);
  const [versionOpen, setVersionOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<StorePlugin | null>(
    null,
  );
  const [checking, setChecking] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registeredResources, setRegisteredResources] = useState<
    ComputeResource[]
  >([]);
  const [selectedResources, setSelectedResources] = useState<ComputeResource[]>(
    [],
  );

  const current = selectedPlugin ?? basePlugin;

  useEffect(() => {
    let alive = true;
    setChecking(true);
    (async () => {
      try {
        const { installed, computeResources } = await checkInstallation(
          current.name,
          current.version,
          isLoggedIn,
        );
        if (!alive) return;
        setIsInstalled(installed);
        setRegisteredResources(computeResources);
        if (
          !installed &&
          computeResources.length === 0 &&
          computeList.length > 0
        ) {
          setSelectedResources([computeList[0]]);
        } else {
          setSelectedResources(computeResources);
        }
      } catch {
        if (alive) setIsInstalled(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [current, computeList, isLoggedIn]);

  const onVersionToggle = (event: React.MouseEvent<MenuToggleElement>) => {
    event.stopPropagation();
    setVersionOpen((prev) => !prev);
  };

  const onResourceToggle = (event: React.MouseEvent<MenuToggleElement>) => {
    event.stopPropagation();
    setResourceOpen((prev) => !prev);
  };

  const onVersionSelect = (
    event?: React.MouseEvent<Element, MouseEvent>,
    value?: StorePlugin,
  ) => {
    event?.stopPropagation();
    if (value) {
      setSelectedPlugin(value);
    }
    setVersionOpen(false);
  };

  const onResourceSelect = (
    event?: React.MouseEvent<Element, MouseEvent>,
    value?: ComputeResource,
  ) => {
    event?.stopPropagation();
    if (!value) return;
    setSelectedResources((prev) => {
      const exists = prev.some((r) => r.data.id === value.data.id);
      return exists
        ? prev.filter((r) => r.data.id !== value.data.id)
        : [...prev, value];
    });
  };

  const handleInstall = async () => {
    if (!onInstall) return;

    setIsInstalled(true); // optimistic
    try {
      onInstall(current, selectedResources);
      setRegisteredResources(selectedResources);
    } catch (err: any) {
      setIsInstalled(false);
    }
  };
  const versionToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onVersionToggle}
      isExpanded={versionOpen}
      style={{ width: "200px" }}
    >
      {current.version}
    </MenuToggle>
  );

  const resourceToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onResourceToggle}
      isExpanded={resourceOpen}
      style={{ width: "200px" }}
    >
      {selectedResources.length
        ? selectedResources.map((r) => r.data.name).join(", ")
        : "Select resources"}
    </MenuToggle>
  );

  const selectedIds = useMemo(
    () => new Set(selectedResources.map((r) => r.data.id)),
    [selectedResources],
  );

  const registeredIds = useMemo(
    () => new Set(registeredResources.map((r) => r.data.id)),
    [registeredResources],
  );
  const hasChanges = useMemo(() => {
    if (!isInstalled) return false;
    if (selectedIds.size !== registeredIds.size) return true;
    for (const id of selectedIds) {
      if (!registeredIds.has(id)) return true;
    }
    return false;
  }, [isInstalled, selectedIds, registeredIds]);

  return (
    <Card className="plugin-item-card" style={{ marginBottom: "1rem" }}>
      <CardBody
        className="plugin-item-card-body"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="plugin-item-name">
          <div style={{ fontSize: "0.9em", fontWeight: "bold" }}>
            {current.name}
          </div>
        </div>
        <div>{current.title}</div>
        <div className="plugin-item-authors">{current.authors}</div>
        <p style={{ fontSize: "0.90rem" }}>
          {format(new Date(current.creation_date), "do MMMM, yyyy")}
        </p>

        <div style={{ marginTop: "1rem" }}>
          <Label>Version</Label>
          <Select
            id="version-select"
            isOpen={versionOpen}
            onSelect={onVersionSelect}
            onOpenChange={(open) => setVersionOpen(open)}
            toggle={versionToggle}
            shouldFocusToggleOnSelect
            popperProps={{ appendTo: () => document.body }}
          >
            {basePlugin.pluginsList.map((v: StorePlugin) => (
              <SelectOption
                isSelected={v.id === current.id}
                key={v.id}
                value={v}
              >
                {v.version}
              </SelectOption>
            ))}
          </Select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Label>Compute</Label>
          <Select
            id="resource-select"
            isOpen={resourceOpen}
            selected={selectedResources}
            //@ts-ignore
            onSelect={onResourceSelect}
            onOpenChange={(open) => setResourceOpen(open)}
            toggle={resourceToggle}
            shouldFocusToggleOnSelect
            popperProps={{ appendTo: () => document.body }}
          >
            {computeList.map((r: ComputeResource) => (
              <SelectOption
                key={r.data.id}
                isSelected={selectedIds.has(r.data.id)}
                value={r}
              >
                {r.data.name}
              </SelectOption>
            ))}
          </Select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          {checking ? (
            <Spinner size="sm" />
          ) : hasChanges ? (
            <Button
              onClick={() => {
                console.log("Modify resouce");
              }}
            >
              Modify Compute{" "}
            </Button>
          ) : isInstalled ? (
            <>
              <Icon status="success" style={{ marginRight: "0.5rem" }}>
                <CheckCircleIcon />
              </Icon>
              <span>Installed</span>
            </>
          ) : (
            <Button onClick={handleInstall}>Install</Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PluginCard;
