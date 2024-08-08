import type { PluginMeta } from "@fnndsc/chrisapi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  FormGroup,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import type React from "react";
import { useCallback, useContext, useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { AddNodeContext } from "./context";
import {
  type BasicConfigurationProps,
  type PluginMetaSelectState,
  Types,
} from "./types";

// Component for basic configuration
const BasicConfiguration: React.FC<BasicConfigurationProps> = ({
  selectedPlugin,
}) => {
  const pluginName =
    selectedPlugin.data.title || selectedPlugin.data.plugin_name;

  return (
    <div className="screen-one">
      <Title headingLevel="h1">Plugin Selection</Title>
      <FormGroup label="Parent node:" fieldId="parent-node">
        <TextInput
          value={`${pluginName} v.${selectedPlugin.data.plugin_version}`}
          aria-label="Selected Plugin Name"
          readOnly
        />
      </FormGroup>

      <FormGroup label="Select plugin to add:" fieldId="plugin">
        <PluginSelect />
      </FormGroup>
    </div>
  );
};

export default BasicConfiguration;

// Component for plugin selection
const PluginSelect: React.FC = () => {
  const [expanded, setExpanded] =
    useState<PluginMetaSelectState["expanded"]>("all-toggle");

  // Function to fetch all plugins
  const fetchAllPlugins = async () => {
    const client = ChrisAPIClient.getClient();
    const params = { limit: 25, offset: 0 };

    try {
      const { resource: pluginMetas } = await fetchResource<PluginMeta>(
        params,
        client.getPluginMetas.bind(client),
      );
      return pluginMetas?.filter((pluginMeta) => pluginMeta.data.type !== "fs");
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  // Query to fetch all plugins
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pluginList"],
    queryFn: () => fetchAllPlugins(),
    refetchOnMount: true,
  });

  // Handle accordion toggle
  const handleAccordionToggle = (toggleId: string) => {
    setExpanded((prev) => (prev === toggleId ? "" : toggleId));
  };

  return (
    <Accordion className="plugin-select">
      <AccordionItem>
        <AccordionToggle
          onClick={() => handleAccordionToggle("all-toggle")}
          isExpanded={expanded === "all-toggle"}
          id="all-toggle"
        >
          All Plugins
        </AccordionToggle>
        <AccordionContent id="all-content" isHidden={expanded !== "all-toggle"}>
          {isLoading ? (
            <SpinContainer title="Fetching the list of plugins" />
          ) : isError ? (
            <Alert type="error" description={error.message} />
          ) : data ? (
            <PluginList pluginMetas={data} />
          ) : (
            <EmptyStateComponent title="No plugins found..." />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// Component to render the plugin list
const PluginList: React.FC<{ pluginMetas: PluginMeta[] }> = ({
  pluginMetas,
}) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const listRef = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState("");
  const { state, dispatch } = useContext(AddNodeContext);
  const { pluginMeta } = state;

  // Handle filter change
  const handleFilterChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setFilter(value);
  };

  // Filter plugins based on the filter input
  const matchesFilter = useCallback(
    (pluginMeta: PluginMeta) =>
      pluginMeta.data.name.toLowerCase().includes(filter.toLowerCase().trim()),
    [filter],
  );

  // Select a plugin from the meta list
  const selectPlugin = async (pluginMeta: PluginMeta) => {
    dispatch({ type: Types.SetPluginMeta, payload: { pluginMeta } });
  };

  const backgroundColor = isDarkTheme ? "#002952" : "#E7F1FA";

  return (
    <ul ref={listRef} className="plugin-list">
      <TextInput
        className="plugin-list-filter"
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filter plugins by name"
        placeholder="Filter by Name"
      />

      {pluginMetas
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
        .filter(matchesFilter)
        .map((item) => {
          const { id, name, title } = item.data;
          const isSelected = pluginMeta && name === pluginMeta.data.name;
          return (
            <li
              key={id}
              style={{
                backgroundColor: isSelected ? backgroundColor : "inherit",
              }}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === "Enter") {
                  selectPlugin(item);
                }
              }}
              onClick={() => selectPlugin(item)}
            >
              <span>{name}</span>
              <span className="description">Description: {title}</span>
            </li>
          );
        })}
    </ul>
  );
};
