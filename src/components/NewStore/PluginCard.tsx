import type { ComputeResource } from "@fnndsc/chrisapi";
import type { Plugin as ChrisPlugin } from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardBody,
  Icon,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectOption,
  Spinner,
} from "@patternfly/react-core";
import { notification } from "antd";
import { format } from "date-fns";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { CheckCircleIcon } from "../Icons";
import type { StorePlugin } from "./hooks/useFetchPlugins";

import styles from "./PluginCard.module.css";

const NOTIF_DURATION = 3;

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
  onModify?: (plugin: ChrisPlugin, computeResources: ComputeResource[]) => void;
  onResourcesChange?: (pluginId: string, resources: ComputeResource[]) => void;
  refreshMap?: Record<string, number>;
}

const PluginCard: React.FC<PluginCardProps> = ({
  basePlugin,
  computeList = [],
  onInstall,
  onModify,
  onResourcesChange,
  refreshMap,
}) => {
  const { isLoggedIn } = useAppSelector((state) => state.user);
  const [versionOpen, setVersionOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<StorePlugin | null>(
    null,
  );
  const [checking, setChecking] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registeredResources, setRegisteredResources] = useState<
    ComputeResource[]
  >([]);
  const [selectedResources, setSelectedResources] = useState<ComputeResource[]>(
    [],
  );
  const [isError, setIsError] = useState(false);
  const errorTimer = useRef<number | null>(null);

  const current = selectedPlugin ?? basePlugin;
  const refreshCount = refreshMap?.[current.id] ?? 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
        const initial =
          !installed && computeResources.length === 0 && computeList.length
            ? [computeList[0]]
            : computeResources;
        setRegisteredResources(computeResources);
        setSelectedResources(initial);
        onResourcesChange?.(current.id, initial);
      } catch {
        if (alive) setIsInstalled(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();

    return () => {
      alive = false;
      if (errorTimer.current != null) {
        clearTimeout(errorTimer.current);
      }
    };
  }, [current, computeList, isLoggedIn, onResourcesChange, refreshCount]);

  const triggerError = (msg: string) => {
    if (errorTimer.current != null) {
      clearTimeout(errorTimer.current);
    }
    notification.error({
      message: "Error",
      description: msg,
      duration: NOTIF_DURATION,
    });
    setIsError(true);
    errorTimer.current = window.setTimeout(
      () => setIsError(false),
      NOTIF_DURATION * 1000,
    );
  };

  const handleInstall = async () => {
    if (!onInstall) return;
    setIsInstalled(true); // optimistic
    try {
      setRegisteredResources(selectedResources);
      onInstall(current, selectedResources);
    } catch (err: any) {
      setIsInstalled(false);
      triggerError(err.message || "Installation failed");
    }
  };

  const handleModifyClick = async () => {
    if (!onModify) return;
    setModifying(true);
    try {
      // optimistic updates
      setRegisteredResources(selectedResources);
      onModify(current, selectedResources);
    } catch (err: any) {
      triggerError(err.message || "Modification failed");
    } finally {
      setModifying(false);
    }
  };

  const versionToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(e) => {
        e.stopPropagation();
        setVersionOpen((v) => !v);
      }}
      isExpanded={versionOpen}
      className={styles.toggle}
    >
      {current.version}
    </MenuToggle>
  );

  const resourceToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(e) => {
        e.stopPropagation();
        setResourceOpen((v) => !v);
      }}
      isExpanded={resourceOpen}
      className={styles.toggle}
    >
      {selectedResources.length
        ? selectedResources[0].data.name
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
    <Card
      className={`plugin-item-card ${styles.card} ${
        isError ? styles.error : ""
      }`}
    >
      <CardBody className={`plugin-item-card-body ${styles.body}`}>
        <div className="plugin-item-name">
          <div className={styles.nameText}>{current.name}</div>
        </div>
        <div>{current.title}</div>
        <div className="plugin-item-authors">{current.authors}</div>
        <p className={styles.dateText}>
          {format(new Date(current.creation_date), "do MMMM, yyyy")}
        </p>

        <div id="config" className={styles.selectContainer}>
          <div className={styles.selectGroup}>
            <Select
              id="version-select"
              isOpen={versionOpen}
              onSelect={(e, v) => {
                e?.stopPropagation();
                v && setSelectedPlugin(v as StorePlugin);
                setVersionOpen(false);
              }}
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

          {isLoggedIn && (
            <div className={styles.selectGroup}>
              <Select
                id="resource-select"
                isOpen={resourceOpen}
                selected={selectedResources}
                // @ts-ignore
                onSelect={(e, val: ComputeResource) => {
                  e?.stopPropagation();
                  const next = selectedResources.some(
                    (r) => r.data.id === val.data.id,
                  )
                    ? selectedResources.filter((r) => r.data.id !== val.data.id)
                    : [...selectedResources, val];
                  setSelectedResources(next);
                  onResourcesChange?.(current.id, next);
                }}
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
          )}
        </div>

        <div className={styles.actions}>
          {checking || modifying ? (
            <Spinner size="sm" />
          ) : hasChanges && isLoggedIn ? (
            <Button onClick={handleModifyClick}>Modify Compute</Button>
          ) : isInstalled ? (
            <div>
              <Icon status="success" className={styles.checkIcon}>
                <CheckCircleIcon />
              </Icon>
              <span>Installed</span>
            </div>
          ) : isLoggedIn ? (
            <Button onClick={handleInstall}>Install</Button>
          ) : (
            <span color="#6A6E73">
              <i>Not Installed</i>
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PluginCard;
