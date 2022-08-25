import React from 'react'
import { GridItem } from '@patternfly/react-core'
import { Plugin } from '@fnndsc/chrisapi'

interface PluginDetailsProps {
  generatedCommand: string
  selectedPlugin?: Plugin
  computeEnvironment: string
}

export const PluginDetails: React.FC<PluginDetailsProps> = ({
  generatedCommand,
  selectedPlugin,
  computeEnvironment,
}: PluginDetailsProps) => {
  const { version, title, name } = selectedPlugin?.data
  const pluginName = `${title ? title : `${name} v.${version}`}`
  return (
    <>
      <GridItem span={2}>
        <span className="review__title">Selected Plugin:</span>
      </GridItem>
      <GridItem span={10}>
        <span className="review__value">
          {pluginName}
        </span>
      </GridItem>
      <GridItem span={2}>
        <span className="review__title">Type of Plugin:</span>
      </GridItem>
      <GridItem span={10}>
        <span className="review__value">
          {selectedPlugin && selectedPlugin.data.type.toUpperCase()}
        </span>
      </GridItem>
      <GridItem span={2}>
        <span className="review__title">Plugin Configuration:</span>
      </GridItem>
      <GridItem span={10}>
        <span className="required-text">{generatedCommand}</span>
      </GridItem>
      <GridItem span={2}>
        <span className="review__title">Compute Enviroment:</span>
      </GridItem>
      <GridItem span={10}>
        <span className="review__value">{computeEnvironment}</span>
      </GridItem>
    </>
  )
}
