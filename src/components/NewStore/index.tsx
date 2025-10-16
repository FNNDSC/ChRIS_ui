// Store.tsx

import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { ComputeResource, Plugin } from "@fnndsc/chrisapi";
import {
  Button,
  Grid,
  GridItem,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { notification } from "antd";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import ChrisAPIClient from "../../api/chrisapiclient";
import { createPipeline } from "../../api/serverApi";
import type { Plugin as PluginType, UploadPipeline } from "../../api/types";
import type * as DoUI from "../../reducers/ui";
import { useAppSelector } from "../../store/hooks";
import { InfoSection, SpinContainer } from "../Common";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import Wrapper from "../Wrapper";
import postModifyComputeResource from "./hooks/updateComputeResource";
import { useComputeResources } from "./hooks/useFetchCompute";
import {
  aggregatePlugins,
  envOptions,
  type StorePlugin,
  useFetchPlugins,
} from "./hooks/useFetchPlugins";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import PluginCard from "./PluginCard";
import { StoreConfigModal } from "./StoreConfigModal";
import StoreToggle from "./StoreToggle";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  useUI: UseThunk<DoUI.State, TDoUI>;
};

const DEFAULT_SEARCH_FIELD = "name";
const COOKIE_NAME = "storeCreds";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // seconds

export default (props: Props) => {
  const { useUI } = props;
  const { isStaff, isLoggedIn } = useAppSelector((state) => state.user);
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);
  const [selectedEnv, setSelectedEnv] = useState<string>("PUBLIC ChRIS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string>();
  const [pending, setPending] = useState<{
    plugin: StorePlugin | Plugin;
    resources: ComputeResource[];
    isModify: boolean;
  } | null>(null);
  const [refreshMap, setRefreshMap] = useState<Record<string, number>>({});
  const [isBulkInstalling, setBulkInstalling] = useState(false);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchPlugins(
    selectedEnv,
    envOptions,
    searchTerm,
    DEFAULT_SEARCH_FIELD,
  );

  const { data: computeList } = useComputeResources(isLoggedIn);

  const getAuthHeaderOrPrompt = useCallback(
    (
      plugin: StorePlugin | Plugin,
      resources: ComputeResource[],
      isModify: boolean,
    ): string | null => {
      if (isStaff) {
        const token = ChrisAPIClient.getClient().auth.token;
        return `Token ${token}`;
      }
      const cookie = cookies[COOKIE_NAME];
      if (cookie) {
        return `Basic ${cookie}`;
      }
      setPending({ plugin, resources, isModify });
      setModalError(undefined);
      setModalOpen(true);
      return null;
    },
    [cookies, isStaff],
  );

  const handleInstall = async (
    plugin: StorePlugin,
    resources: ComputeResource[],
  ) => {
    const hdr = getAuthHeaderOrPrompt(plugin, resources, false);
    if (!hdr) return;
    const result: PluginType = await handleInstallPlugin(
      hdr,
      // @ts-expect-error
      { name: plugin.name, version: plugin.version, url: plugin.url },
      resources,
    );
    console.info(
      "NewStore.Store.handleInstall: after handleInstallPlugin: plugin:",
      plugin,
      "resources",
      resources,
      "result:",
      result,
    );

    const pipelineName = `${plugin.name}-${plugin.version}`;

    const pipeline: UploadPipeline = {
      name: pipelineName,
      authors: plugin.authors,
      category: plugin.category,
      description: plugin.description,
      locked: false,
      plugin_tree: [
        {
          title: plugin.name,
          previous: null,
          plugin: `${plugin.name} v${plugin.version}`,
        },
      ],
    };

    const resultPipeline = await createPipeline(pipeline);

    console.info(
      "NewStore.Store.handleInstall: after createPipeline: resultPipeline:",
      resultPipeline,
    );
  };

  const handleModify = async (plugin: Plugin, resources: ComputeResource[]) => {
    const hdr = getAuthHeaderOrPrompt(plugin, resources, true);
    if (!hdr) return;
    try {
      await postModifyComputeResource({
        adminCred: hdr,
        plugin,
        newComputeResource: resources,
      });
    } catch (err: any) {
      notification.error({
        message: "Modification failed",
        description: err.message || "Modification failed",
        duration: 3,
      });
    }
  };

  const handleModalConfirm = async (username: string, password: string) => {
    if (!pending) return;
    const creds = btoa(`${username}:${password}`);
    const hdr = `Basic ${creds}`;

    try {
      if (pending.isModify) {
        await postModifyComputeResource({
          adminCred: hdr,
          plugin: pending.plugin as Plugin,
          newComputeResource: pending.resources,
        });
      } else {
        const p = pending.plugin as StorePlugin;
        await handleInstallPlugin(
          hdr,
          // @ts-expect-error
          { name: p.name, version: p.version, url: p.url },
          pending.resources,
        );
      }
      setCookie(COOKIE_NAME, creds, { path: "/", maxAge: COOKIE_MAX_AGE });
      setModalOpen(false);
      setPending(null);
      setModalError(undefined);
    } catch (err: any) {
      notification.error({
        message: pending.isModify
          ? "Modification failed"
          : "Installation failed",
        description: err.message || "Operation failed",
        duration: 3,
      });
      setModalError(err.message || "Operation failed");
    }
  };

  const resetCredentials = () => {
    removeCookie(COOKIE_NAME, { path: "/" });
    setModalError(undefined);
    setModalOpen(true);
  };

  const selectionMapRef = useRef<Record<string, ComputeResource[]>>({});
  const handleResourcesChange = useCallback(
    (pluginId: string, resources: ComputeResource[]) => {
      selectionMapRef.current[pluginId] = resources;
    },
    [],
  );

  const rawPlugins: Plugin[] = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data],
  );
  const allPlugins: StorePlugin[] = useMemo(
    () => aggregatePlugins(rawPlugins),
    [rawPlugins],
  );

  const defaultResource = computeList?.[0];
  const installAllPlugins = async () => {
    setBulkInstalling(true);
    const installs = allPlugins.map(async (plg) => {
      const sel = selectionMapRef.current[plg.id] || [];
      const resources = sel.length
        ? sel
        : defaultResource
          ? [defaultResource]
          : [];
      try {
        await handleInstall(plg, resources);
      } finally {
        setRefreshMap((prev) => ({
          ...prev,
          [plg.id]: (prev[plg.id] ?? 0) + 1,
        }));
      }
    });
    const results = await Promise.allSettled(installs);
    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message || "");
    if (errors.length) {
      notification.error({
        message: "Some installs failed",
        description: errors.join("; "),
        duration: 5,
      });
    } else {
      notification.success({ message: "All plugins installed!", duration: 3 });
    }
    setBulkInstalling(false);
  };

  const showInstallAll =
    isLoggedIn && searchTerm.trim() !== "" && rawPlugins.length > 0;
  const observerTarget = useRef<HTMLDivElement | null>(null);
  useInfiniteScroll(observerTarget, { fetchNextPage, hasNextPage });

  return (
    <>
      <Wrapper
        useUI={useUI}
        titleComponent={
          <InfoSection title="Import Package" content="Work in Progress" />
        }
      >
        <Toolbar isSticky id="store-toolbar" clearAllFilters={() => {}}>
          <ToolbarGroup
            variant="filter-group"
            spaceItems={{ default: "spaceItemsMd" }}
          >
            <ToolbarItem>
              <StoreToggle onEnvironmentChange={setSelectedEnv} />
            </ToolbarItem>
            <ToolbarItem>
              <TextInput
                id="search-plugins"
                placeholder="Search plugins"
                value={searchTerm}
                onChange={(_e, val) => setSearchTerm(val)}
              />
            </ToolbarItem>
            {showInstallAll && (
              <ToolbarItem>
                <Button
                  variant="secondary"
                  onClick={installAllPlugins}
                  isDisabled={!allPlugins.length}
                  isLoading={isBulkInstalling}
                >
                  Import All
                </Button>
              </ToolbarItem>
            )}
            {!isStaff && isLoggedIn && (
              <ToolbarItem align={{ default: "alignRight" }}>
                <Button variant="link" onClick={resetCredentials}>
                  Reconfigure Admin
                </Button>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </Toolbar>

        {isLoading ? (
          <SpinContainer title="Fetching Packages..." />
        ) : isError ? (
          <div>Error loading packages.</div>
        ) : (
          <>
            <Grid hasGutter sm={12} lg={6} md={6} style={{ marginTop: "1rem" }}>
              {allPlugins.map((plugin) => (
                <GridItem key={plugin.id} span={6}>
                  <PluginCard
                    basePlugin={plugin}
                    computeList={computeList || []}
                    onInstall={handleInstall}
                    onModify={handleModify}
                    onResourcesChange={handleResourcesChange}
                    refreshMap={refreshMap}
                  />
                </GridItem>
              ))}
            </Grid>
            <div ref={observerTarget} style={{ height: 1 }} />
            {hasNextPage && (
              <Button
                variant="primary"
                onClick={() => fetchNextPage()}
                isDisabled={isFetchingNextPage}
                style={{ marginTop: "1rem" }}
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </Button>
            )}
          </>
        )}
      </Wrapper>

      <StoreConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        modalError={modalError}
      />
    </>
  );
};
