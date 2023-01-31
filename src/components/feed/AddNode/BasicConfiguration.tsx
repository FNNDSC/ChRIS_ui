import React, { useState, useEffect, useCallback } from "react";
import {
  FormGroup,
  TextInput,
  Title,
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
} from "@patternfly/react-core";
import { BasicConfigurationProps } from "./types";
import { PluginMeta } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { LoadingContent } from "../../common/loading/LoadingContent";
import { PluginMetaSelectState } from "./types";
import { fetchResource } from "../../../api/common";
import { useContext } from "react";
import { AddNodeContext } from "./context";
import { Types } from "./types";

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
  const [isMounted, setMounted] = useState(false);
  const { dispatch } = useContext(AddNodeContext);

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
    if (isMounted && pluginMetas) {
      dispatch({
        type: Types.SetPluginMetaList,
        payload: {
          pluginMetas: pluginMetas,
        },
      });
    }
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
          <PluginList />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const PluginList: React.FC = () => {
  const [filter, setFilter] = useState("");
  const { state, dispatch } = useContext(AddNodeContext);
  const { pluginMetas, pluginMeta } = state;

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
    dispatch({
      type: Types.SetPluginMeta,
      payload: {
        pluginMeta,
      },
    });
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
            .map((item) => {
              const { id, name, title } = item.data;
              const isSelected = pluginMeta && name === pluginMeta.data.name;
              return (
                <li
                  key={id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => getPluginFromMeta(item)}
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
