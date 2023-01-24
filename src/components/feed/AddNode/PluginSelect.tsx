import React, { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  TextInput,
} from "@patternfly/react-core";
import { Plugin, PluginMeta } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { LoadingContent } from "../../common/loading/LoadingContent";
import {
  PluginSelectProps,
  PluginMetaListProps,
  PluginMetaSelectState,
} from "./types";
import { fetchResource } from "../../../api/common";

const PluginList: React.FC<PluginMetaListProps> = ({
  pluginMetas,
  selected,
  handlePluginSelect,
}) => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (filter: string) => setFilter(filter);
  const matchesFilter = useCallback(
    (pluginMeta: PluginMeta) =>
      pluginMeta.data.name
        .toLowerCase()
        .trim()
        .includes(filter.toLowerCase().trim()),
    [filter]
  );
  const loading = new Array(3)
    .fill(null)
    .map((_, i) => (
      <LoadingContent width="100%" height="35px" bottom="4px" key={i} />
    ));

  const getPluginFromMeta = async (pluginMeta: PluginMeta) => {
    const fn = pluginMeta.getPlugins;
    const boundFn = fn.bind(pluginMeta);
    const params = {
      limit: 1000,
      offset: 0,
    };

    const results = await fetchResource<Plugin>(params, boundFn);
    results["resource"].sort((a, b) =>
      a.data.version > b.data.version
        ? -1
        : b.data.version > a.data.version
        ? 1
        : 0
    );
    handlePluginSelect(results["resource"][0]);
  };

  return (
    <ul className="plugin-list">
      <TextInput
        className="plugin-list-filter"
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filter plugins by name"
        placeholder="Filter by Name"
      />
      {pluginMetas
        ? pluginMetas
            .sort((a, b) => a.data.name.localeCompare(b.data.name))
            .filter(matchesFilter)
            .map((pluginMeta) => {
              const { id, name, title } = pluginMeta.data;
              const isSelected = selected && name === selected.data.name;
              return (
                <li
                  key={id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => getPluginFromMeta(pluginMeta)}
                >
                  <span>{name}</span>
                  <span className="description">Description: {title}</span>
                </li>
              );
            })
        : loading}
    </ul>
  );
};

const PluginSelect: React.FC<PluginSelectProps> = ({
  selected,
  handlePluginSelect,
}) => {
  const [isMounted, setMounted] = useState(false);
  const [allPlugins, setAllPlugins] = useState<
    PluginMetaSelectState["allPlugins"]
  >([]);
  const [expanded, setExpanded] =
    useState<PluginMetaSelectState["expanded"]>("all-toggle");

  const fetchAllPlugins = React.useCallback(async () => {
    const client = ChrisAPIClient.getClient();
    const params = { limit: 25, offset: 0 };
    const fn = client.getPluginMetas;
    const boundFn = fn.bind(client);
    let { resource: pluginMetas } = await fetchResource<PluginMeta>(
      params,
      boundFn
    );

    pluginMetas =
      pluginMetas &&
      pluginMetas.filter((pluginMeta) => pluginMeta.data.type !== "fs");

    if (isMounted && pluginMetas) setAllPlugins(pluginMetas);
  }, [isMounted]);

  useEffect(() => {
    setMounted(true);
    fetchAllPlugins();
  }, [fetchAllPlugins]);

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
          <PluginList
            pluginMetas={allPlugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PluginSelect;
