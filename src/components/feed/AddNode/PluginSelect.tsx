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

const PluginList: React.FC<PluginListProps> = ({
  plugins,
  selected,
  handlePluginSelect,
}) => {
  const [filter, setFilter] = useState('')
  // const [versionList, setVersionList] = useState<string[]>()
  // const [expanded, setExpanded] = useState<string>(
    // 'versionNotExpanded',
  // )
  // const [toggle, setToggle] = useState<boolean>(false)
  // const [expanded, setExpanded] = React.useState('');

  const handleFilterChange = (filter: string) => setFilter(filter)
  const matchesFilter = useCallback(
    (plugin: Plugin) =>
      plugin.data.name
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
  
  // const onToggle = (id: string) => {
  //   if (id === expanded) {
  //     setExpanded('');
  //   } else {
  //     setExpanded(id);
  //   }
  // };

  
  // const fetchVersionPlugins = React.useCallback(async (pluginName: string) => {
  //   const client = ChrisAPIClient.getClient()
  //   const params = { limit: 25, offset: 0, name: pluginName }
  //   let pluginList = await client.getPlugins(params)
  //   const plugins = pluginList.getItems()
  //   const pluginVersions: string[] = [];
  //   // New code
  //   while (pluginList.hasNextPage) {
  //     try {
  //           params.offset += params.limit
  //           pluginList = await client.getPlugins(params)
  //           const itemsList = pluginList.getItems()
  //           if (itemsList && plugins) {
  //             plugins.push(...itemsList)
  //           }
  //         } catch (e) {
  //           console.error(e)
  //         }
  //   }
  //   if (plugins) {
  //     for (let i = 0; i < plugins.length; i++) {
  //       pluginVersions.push(plugins[i].data.version);
  //     }
  //   }
  //   console.log(pluginVersions);
  //   if (pluginVersions.length > 0) {
  //     // setExpanded('versionExpanded');
  //     setToggle(toggle => !toggle)
  //     setVersionList(pluginVersions => pluginVersions)
  //   }
  // }, [])

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
              const { id, name, title } = plugin.data
              const isSelected = selected && id === selected.data.id
              return (                
                <li
                  key={id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => handlePluginSelect(plugin)}
                >
                  <span> {name}</span>
                  <span className="description">
                    Description: {title}
                  </span>
                </li>
              )
            })
        : loading}
    </ul>
  )
  // return (
  //   <Accordion asDefinitionList className="plugin-list">
  //     <TextInput
  //       className="plugin-list-filter"
  //       value={filter}
  //       onChange={handleFilterChange}
  //       aria-label="Filter plugins by name"
  //       placeholder="Filter by Name"
  //     />

  //     {plugins
  //       ? plugins
  //           .sort((a, b) => a.data.name.localeCompare(b.data.name))
  //           .filter(matchesFilter)
  //           .map((plugin) => {
  //             const { id, name, title } = plugin.data
  //             const isSelected = selected && id === selected.data.id
  //             return (
  //               <AccordionItem key={id}>
  //                 <AccordionToggle
  //                   onClick={() => {
  //                     onToggle(name);
  //                   }}
  //                   isExpanded={expanded === String(name)}
  //                   id={name}
  //                   style={{color:"dark"}}
  //                   className = '--pf-global--Color--100'
  //                   // className={isSelected ? 'selected' : ''}
  //                 >
  //                   {/* Create a react component */}
  //                   {/* <div>{name}</div> */}
  //                   <div style={{display:"flex", justify}}>
  //                     {name}
  //                   </div>
  //                   <div className="description">
  //                     {name}
  //                     Description: {title}
  //                   </div>
  //                 </AccordionToggle>
  //                 <AccordionContent id={name} isHidden={expanded !== name}>
  //                   <p>
  //                     {name}
  //                   </p>
  //                 </AccordionContent>
  //               </AccordionItem>
  //             )
  //           })
  //       : loading}

  //   </Accordion>
  // );
}

const PluginSelect: React.FC<PluginSelectProps> = ({
  selected,
  handlePluginSelect,
}) => {
  const [isMounted, setMounted] = useState(false)
  const [allPlugins, setAllPlugins] = useState<PluginSelectState['allPlugins']>(
    [],
  )
  const [recentPlugins, setRecentPlugins] = useState<
    PluginSelectState['recentPlugins']
  >([])
  const [expanded, setExpanded] = useState<PluginSelectState['expanded']>(
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
        return client.getPlugin(id)
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
// PluginList should be edited to return plugin and description - pluginMeta
// On click/select, an accordion toggle/content should show the different
// versions if only one version, it should be selected. If not wait for
// user input.