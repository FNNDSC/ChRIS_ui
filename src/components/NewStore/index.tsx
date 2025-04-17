// Store.tsx
import type React from "react";
import { useMemo, useState } from "react";
import type { Plugin } from "@fnndsc/chrisapi";
import {
  Button,
  Grid,
  GridItem,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { useAppSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import Wrapper from "../Wrapper";
import PluginCard from "./PluginCard";
import StoreToggle from "./StoreToggle";
import { StoreConfigModal } from "./StoreConfigModal";
import {
  envOptions,
  type StorePlugin,
  useFetchPlugins,
} from "./hooks/useFetchPlugins";
import { aggregatePlugins } from "./hooks/useFetchPlugins";
import { useComputeResources } from "./hooks/useFetchCompute";
import ChrisAPIClient from "../../api/chrisapiclient";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import type { ComputeResource } from "@fnndsc/chrisapi";

const DEFAULT_SEARCH_FIELD = "name";

const Store: React.FC = () => {
  const { isStaff } = useAppSelector((state) => state.user);
  const [selectedEnv, setSelectedEnv] = useState<string>("PUBLIC ChRIS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState<{
    plugin: StorePlugin;
    resources: ComputeResource[];
  } | null>(null);

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

  const { data: computeList } = useComputeResources();

  const rawPlugins: Plugin[] = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data],
  );

  const allPlugins: StorePlugin[] = useMemo(
    () => aggregatePlugins(rawPlugins),
    [rawPlugins],
  );

  const handleInstall = (plugin: StorePlugin, resources: ComputeResource[]) => {
    if (isStaff) {
      const token = ChrisAPIClient.getClient().auth.token;
      handleInstallPlugin(
        `Token ${token}`,
        { name: plugin.name, version: plugin.version, url: plugin.url },
        resources,
      );
    } else {
      setPending({ plugin, resources });
      setModalError(undefined);
      setModalOpen(true);
    }
  };

  const handleModalConfirm = async (username: string, password: string) => {
    if (!pending) return;
    const creds = btoa(`${username}:${password}`);
    try {
      await handleInstallPlugin(
        `Basic ${creds}`,
        {
          name: pending.plugin.name,
          version: pending.plugin.version,
          url: pending.plugin.url,
        },
        pending.resources,
      );
      setModalOpen(false);
      setPending(null);
      setModalError(undefined);
    } catch (err: any) {
      setModalError(err.message || "Installation failed");
    }
  };

  return (
    <>
      <Wrapper titleComponent={<div>Store</div>}>
        <Toolbar id="store-toolbar" clearAllFilters={() => {}}>
          <ToolbarGroup variant="filter-group">
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
          </ToolbarGroup>
        </Toolbar>

        {isLoading ? (
          <SpinContainer title="Fetching Plugins..." />
        ) : isError ? (
          <div>Error loading plugins.</div>
        ) : (
          <>
            <Grid hasGutter style={{ marginTop: "1rem" }}>
              {allPlugins.map((plugin) => (
                <GridItem key={plugin.id} span={6}>
                  <PluginCard
                    basePlugin={plugin}
                    computeList={computeList || []}
                    onInstall={handleInstall}
                  />
                </GridItem>
              ))}
            </Grid>
            {hasNextPage ? (
              <Button
                variant="primary"
                onClick={() => fetchNextPage()}
                isDisabled={isFetchingNextPage}
                style={{ marginTop: "1rem" }}
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </Button>
            ) : null}
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

export default Store;
