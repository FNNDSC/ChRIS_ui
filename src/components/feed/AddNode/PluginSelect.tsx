import React, { useCallback, useEffect, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  TextInput,
} from '@patternfly/react-core'
import { Plugin, PluginMeta, PluginInstance } from '@fnndsc/chrisapi'
import ChrisAPIClient from '../../../api/chrisapiclient'
import { LoadingContent } from '../../common/loading/LoadingContent'
import { PluginSelectProps, PluginMetaListProps, PluginMetaSelectState } from './types'
import { fetchResource } from '../../../api/common'

const PluginList: React.FC<PluginMetaListProps> = ({
  pluginMetas,
  selected,
  handlePluginSelect,
}) => {
  const [filter, setFilter] = useState('')

  const handleFilterChange = (filter: string) => setFilter(filter)
  const matchesFilter = useCallback(
    (pluginMeta: PluginMeta) =>
      pluginMeta.data.name
        .toLowerCase()
        .trim()
        .includes(filter.toLowerCase().trim()),
    [filter],
  )
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
    results["resource"].sort((a, b) => (a.data.version > b.data.version) ? -1 : (b.data.version > a.data.version) ? 1 : 0)
    handlePluginSelect(results["resource"][0])
  }
  


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
              const { id, name, title } = pluginMeta.data
              const isSelected = selected && name === selected.data.name
              return (                
                <li
                  key={id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => getPluginFromMeta(pluginMeta)}
                >
                  <span>{name}</span>
                  <span className="description">
                    Description: {title}
                  </span>
                </li>
              )
            })
        : loading}
    </ul>
  )
}

const PluginSelect: React.FC<PluginSelectProps> = ({
  selected,
  handlePluginSelect,
}) => {
  const [isMounted, setMounted] = useState(false)
  const [allPlugins, setAllPlugins] = useState<PluginMetaSelectState['allPlugins']>(
    [],
  )
  const [recentPlugins, setRecentPlugins] = useState<
    PluginMetaSelectState['recentPlugins']
  >([])
  const [expanded, setExpanded] = useState<PluginMetaSelectState['expanded']>(
    'all-toggle',
  )

  const fetchAllPlugins = React.useCallback(async () => {
    const client = ChrisAPIClient.getClient()
    const params = { limit: 25, offset: 0 }
    let pluginMetaList = await client.getPluginMetas(params)
    let pluginMetas = pluginMetaList.getItems()

    while (pluginMetaList.hasNextPage) {
      try {
        params.offset += params.limit
        pluginMetaList = await client.getPluginMetas(params);
        const itemsList = pluginMetaList.getItems()
        if (itemsList && pluginMetas) {
          pluginMetas.push(...itemsList)
        }
      } catch (e) {
        console.error(e)
      }
    }

    pluginMetas = pluginMetas && pluginMetas.filter((pluginMeta) => pluginMeta.data.type !== 'fs')

    if (isMounted && pluginMetas) setAllPlugins(pluginMetas)
  }, [isMounted])

  const fetchRecentPlugins = React.useCallback(async () => {
    const amount = 5

    const client = ChrisAPIClient.getClient()
    const pluginIds: number[] = []

    const params = { limit: 10, offset: 0 }
    let pluginInstanceList = await client.getPluginInstances(params)

    while (pluginIds.length < amount && pluginInstanceList.hasNextPage) {
      // plugin instance list is ordered by most recently instantiated
      pluginInstanceList = await client.getPluginInstances(params)
      const instanceItems = pluginInstanceList.getItems()

      if (instanceItems) {
        const pluginsInstances = instanceItems.filter(
          (pluginInst: PluginInstance, i, instances: PluginInstance[]) => {
            // dedeuplicate plugins
            const { plugin_id } = pluginInst.data
            const inCurrentList = instances.find(
              (p) => p.data.plugin_id === plugin_id,
            )
            const inTotalList = pluginIds.find((p) => p === plugin_id)
            return (
              !inTotalList &&
              inCurrentList &&
              instances.indexOf(inCurrentList) === i
            )
          },
        )
        const ids = pluginsInstances.map(
          (pluginInst: PluginInstance) => pluginInst.data.plugin_id,
        )
        pluginIds.push(...ids)
        params.offset += params.limit
      }
    }

    const plugins = await Promise.all(
      pluginIds.map((id) => {
        return client.getPluginMeta(id)
      }),
    )
    if (isMounted) setRecentPlugins(plugins)
  }, [isMounted])

  useEffect(() => {
    setMounted(true)
    fetchAllPlugins()
    fetchRecentPlugins()
  }, [fetchAllPlugins, fetchRecentPlugins])

  const handleAccordionToggle = (_expanded: string) => {
    if (_expanded === expanded) {
      setExpanded('')
    } else {
      setExpanded(_expanded)
    }
  }

  return (
    <Accordion className="plugin-select">
      <AccordionItem>
        <AccordionToggle
          onClick={() => handleAccordionToggle('recent-toggle')}
          isExpanded={expanded === 'recent-toggle'}
          id="recent-toggle"
        >
          Recently Used Plugins
        </AccordionToggle>
        <AccordionContent
          id="recent-content"
          isHidden={expanded !== 'recent-toggle'}
        >
          <PluginList
            pluginMetas={recentPlugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => handleAccordionToggle('all-toggle')}
          isExpanded={expanded === 'all-toggle'}
          id="all-toggle"
        >
          All Plugins
        </AccordionToggle>
        <AccordionContent id="all-content" isHidden={expanded !== 'all-toggle'}>
          <PluginList
            pluginMetas={allPlugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default PluginSelect