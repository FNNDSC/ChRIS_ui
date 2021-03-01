import React from "react";
import classNames from "classnames";

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  TextInput,
} from "@patternfly/react-core";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";
import LoadingContent from "../../common/loading/LoadingContent";
import {
  PluginListState,
  PluginListProps,
  PluginSelectProps,
  PluginSelectState,
} from "./types";

class PluginList extends React.Component<PluginListProps, PluginListState> {
  constructor(props: PluginListProps) {
    super(props);
    this.state = {
      filter: "",
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.matchesFilter = this.matchesFilter.bind(this);
  }

  handleFilterChange(filter: string) {
    this.setState({ filter });
  }

  matchesFilter(plugin: Plugin) {
    return plugin.data.name
      .toLowerCase()
      .trim()
      .includes(this.state.filter.toLowerCase().trim());
  }

  render() {
    const { plugins, selected, handlePluginSelect } = this.props;
    const { filter } = this.state;

    const loading = new Array(3)
      .fill(null)
      .map((_, i) => (
        <LoadingContent width="100%" height="35px" bottom="4px" key={i} />
      ));

    return (
      <ul className="plugin-list">
        <TextInput
          className="plugin-list-filter"
          value={filter}
          onChange={this.handleFilterChange}
          aria-label="Filter plugins by name"
          placeholder="Filter by Name"
        />
        {plugins
          ? plugins
              .sort((a, b) => a.data.name.localeCompare(b.data.name))
              .filter(this.matchesFilter)
              .map((plugin) => {
                const { id, name } = plugin.data;
                const isSelected = selected && id === selected.data.id;
                return (
                  <li
                    key={id}
                    className={classNames(isSelected && "selected")}
                    onClick={() => handlePluginSelect(plugin)}
                  >
                    {name}
                  </li>
                );
              })
          : loading}
      </ul>
    );
  }
}

class PluginSelect extends React.Component<
  PluginSelectProps,
  PluginSelectState
> {
  _isMounted = false;
  constructor(props: PluginSelectProps) {
    super(props);
    this.state = {
      expanded: "all-toggle",
    };

    this.handleAccordionToggle = this.handleAccordionToggle.bind(this);
  }

  componentDidMount() {
    this._isMounted  =  true;
    this.fetchAllPlugins();
    this.fetchRecentPlugins();
  }

  componentWillUnmount(){
    this._isMounted=false
  }

  async fetchAllPlugins() {
    const client = ChrisAPIClient.getClient();
    const params = { limit: 25, offset: 0 };
    let pluginList = await client.getPlugins(params);
    let plugins = pluginList.getItems();

    while (pluginList.hasNextPage) {
      try {
        params.offset += params.limit;
        pluginList = await client.getPlugins(params);
        plugins.push(...pluginList.getItems());
      } catch (e) {
        console.error(e);
      }
    }

    plugins = plugins.filter((plugin) => plugin.data.type === "ds");
    
    if(this._isMounted)
    this.setState({ allPlugins: plugins });
  }

  // fetch last 5 used plugins
  async fetchRecentPlugins() {
    const amount = 5;

    const client = ChrisAPIClient.getClient();
    const pluginIds: number[] = [];

    const params = { limit: 10, offset: 0 };
    let pluginInstanceList = await client.getPluginInstances(params);

    while (pluginIds.length < amount && pluginInstanceList.hasNextPage) {
      // plugin instance list is ordered by most recently instantiated
      pluginInstanceList = await client.getPluginInstances(params);

      const pluginsInstances = pluginInstanceList
        .getItems()
        .filter(
          (pluginInst: PluginInstance, i, instances: PluginInstance[]) => {
            // dedeuplicate plugins
            const { plugin_id } = pluginInst.data;
            const inCurrentList = instances.find(
              (p) => p.data.plugin_id === plugin_id
            );
            const inTotalList = pluginIds.find((p) => p === plugin_id);
            return (
              !inTotalList &&
              inCurrentList &&
              instances.indexOf(inCurrentList) === i
            );
          }
        );

      const ids = pluginsInstances.map(
        (pluginInst: PluginInstance) => pluginInst.data.plugin_id
      );

      pluginIds.push(...ids);
      params.offset += params.limit;
    }

    const plugins = await Promise.all(
      pluginIds.map((id) => {
        return client.getPlugin(id);
      })
    );
    if(this._isMounted)
    this.setState({ recentPlugins: plugins });
  }

  handleAccordionToggle(expanded: string) {
    if (expanded === this.state.expanded) {
      this.setState({
        expanded: "",
      });
    }
    else{
     this.setState({ expanded });
    }  
  }

  render() {
    const { selected, handlePluginSelect } = this.props;
    const { allPlugins, recentPlugins } = this.state;

    return (
      <Accordion className="plugin-select">
        <AccordionItem >
          <AccordionToggle
            onClick={() => this.handleAccordionToggle("recent-toggle")}
            isExpanded={this.state.expanded === "recent-toggle"}
            id="recent-toggle"
          >
            Recently Used Plugins
          </AccordionToggle>
          <AccordionContent
            id="recent-content"
            isHidden={this.state.expanded !== "recent-toggle"}
          >
            <PluginList
              plugins={recentPlugins}
              selected={selected}
              handlePluginSelect={handlePluginSelect}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionToggle
            onClick={() => this.handleAccordionToggle("all-toggle")}
            isExpanded={this.state.expanded === "all-toggle"}
            id="all-toggle"
          >
            All Plugins
          </AccordionToggle>
          <AccordionContent
            id="all-content"
            isHidden={this.state.expanded !== "all-toggle"}
          >
            <PluginList
              plugins={allPlugins}
              selected={selected}
              handlePluginSelect={handlePluginSelect}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
}

export default PluginSelect;
