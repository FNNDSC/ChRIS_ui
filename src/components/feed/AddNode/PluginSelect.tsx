import React, { useCallback, useEffect, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionToggle,
  TextInput,
} from '@patternfly/react-core'
import { Plugin, PluginInstance } from '@fnndsc/chrisapi'
import ChrisAPIClient from '../../../api/chrisapiclient'
import { LoadingContent } from '../../common/loading/LoadingContent'
import { PluginListProps, PluginSelectProps, PluginSelectState } from './types'

const PluginList: React.FC<PluginListProps> = ({ plugins, selected, handlePluginSelect }) => {
  const [filter, setFilter] = useState('')

  const handleFilterChange = (filter: string) => setFilter(filter)
  const matchesFilter = useCallback(
    (plugin: Plugin) => plugin.data.name.toLowerCase().trim().includes(filter.toLowerCase().trim()),
    [filter]
  )
  const loading = new Array(3)
    .fill(null)
    .map((_, i) => <LoadingContent width="100%" height="35px" bottom="4px" key={i} />)

  return (
    <ul className="plugin-list">
      <TextInput
        className="plugin-list-filter"
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filter plugins by name"
        placeholder="Filter by Name"
      />
      {plugins
        ? plugins
            .sort((a, b) => a.data.name.localeCompare(b.data.name))
            .filter(matchesFilter)
            .map((plugin) => {
              const { id, name, version, description } = plugin.data
              const isSelected = selected && id === selected.data.id
              return (
                <li
                  key={id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => handlePluginSelect(plugin)}
                >
                  <span> {name}</span>
                  <span className="version">Version: {version}</span>
                  <span className="description">Description: {description}</span>
                </li>
              )
            })
        : loading}
    </ul>
  )
}

const PluginSelect: React.FC<PluginSelectProps> = ({ selected, handlePluginSelect }) => {
  const [isMounted, setMounted] = useState(false)
  const [allPlugins, setAllPlugins] = useState<PluginSelectState['allPlugins']>([])
  const [recentPlugins, setRecentPlugins] = useState<PluginSelectState['recentPlugins']>([])
  const [expanded, setExpanded] = useState<PluginSelectState['expanded']>('all-toggle')

  const fetchAllPlugins = React.useCallback(async () => {
    const client = ChrisAPIClient.getClient()
    const params = { limit: 25, offset: 0 }
    let pluginList = await client.getPlugins(params)
    let plugins = pluginList.getItems()

    while (pluginList.hasNextPage) {
      try {
        params.offset += params.limit
        pluginList = await client.getPlugins(params)
        const itemsList = pluginList.getItems()
        if (itemsList && plugins) {
          plugins.push(...itemsList)
        }
      } catch (e) {
        console.error(e)
      }
    }

    plugins = plugins && plugins.filter((plugin) => plugin.data.type !== 'fs')

    if (isMounted && plugins) setAllPlugins(plugins)
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
            const inCurrentList = instances.find((p) => p.data.plugin_id === plugin_id)
            const inTotalList = pluginIds.find((p) => p === plugin_id)
            return !inTotalList && inCurrentList && instances.indexOf(inCurrentList) === i
          }
        )
        const ids = pluginsInstances.map((pluginInst: PluginInstance) => pluginInst.data.plugin_id)
        pluginIds.push(...ids)
        params.offset += params.limit
      }
    }

    const plugins = await Promise.all(pluginIds.map((id) => client.getPlugin(id)))
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
        <AccordionContent id="recent-content" isHidden={expanded !== 'recent-toggle'}>
          <PluginList
            plugins={recentPlugins}
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
            plugins={allPlugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default PluginSelect
