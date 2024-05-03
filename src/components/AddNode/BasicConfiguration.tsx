import { PluginMeta } from "@fnndsc/chrisapi";
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
import React, { useCallback, useContext, useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { AddNodeContext } from "./context";
import { BasicConfigurationProps, PluginMetaSelectState, Types } from "./types";

const BasicConfiguration: React.FC<BasicConfigurationProps> = ({
  selectedPlugin,
}) => {
  const value = selectedPlugin.data.title || selectedPlugin.data.plugin_name;

  return (
    <div className="screen-one">
      <Title headingLevel="h1">Plugin Selection</Title>
      <FormGroup label="Parent node:" fieldId="parent-node">
        <TextInput
          value={`${value} v.${selectedPlugin.data.plugin_version}`}
          aria-label="Selected Plugin Name"
          readOnly={true}
        />
      </FormGroup>

      <FormGroup label="Select plugin to add:" fieldId="plugin">
        <PluginSelect />
      </FormGroup>
    </div>
  );
};

export default BasicConfiguration;

const PluginSelect: React.FC = () => {
  const [expanded, setExpanded] =
    useState<PluginMetaSelectState["expanded"]>("all-toggle");

  const fetchAllPlugins = async () => {
    const client = ChrisAPIClient.getClient();
    const params = { limit: 25, offset: 0 };
    const fn = client.getPluginMetas;
    const boundFn = fn.bind(client);

    try {
      let { resource: pluginMetas } = await fetchResource<PluginMeta>(
        params,
        boundFn,
      );

      pluginMetas = pluginMetas?.filter(
        (pluginMeta) => pluginMeta.data.type !== "fs",
      );

      return pluginMetas;
    } catch (e) {
      throw e;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pluginList"],
    queryFn: () => fetchAllPlugins(),
    refetchOnMount: true,
  });

  const handleAccordionToggle = (_expanded: string) => {
    if (_expanded === expanded) {
      setExpanded("");
    } else {
      setExpanded(_expanded);
    }
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

const PluginList = ({ pluginMetas }: { pluginMetas: PluginMeta[] }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const listRef = useRef<any>();
  const [filter, setFilter] = useState("");
  const { state, dispatch } = useContext(AddNodeContext);
  const { pluginMeta } = state;

  const handleFilterChange = (
    _event: React.FormEvent<HTMLInputElement>,
    filter: string,
  ) => setFilter(filter);
  const matchesFilter = useCallback(
    (pluginMeta: PluginMeta) =>
      pluginMeta.data.name
        .toLowerCase()
        .trim()
        .includes(filter.toLowerCase().trim()),
    [filter],
  );

  const getPluginFromMeta = async (pluginMeta: PluginMeta) => {
    dispatch({
      type: Types.SetPluginMeta,
      payload: {
        pluginMeta,
      },
    });
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
              onKeyDown={(event: any) => {
                if (event.key === "Enter") {
                  getPluginFromMeta(item);
                }
              }}
              onClick={() => getPluginFromMeta(item)}
            >
              <span>{name}</span>
              <span className="description">Description: {title}</span>
            </li>
          );
        })}
    </ul>
  );
};
