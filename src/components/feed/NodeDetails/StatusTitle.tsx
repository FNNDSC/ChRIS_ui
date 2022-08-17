import React from 'react'
import { Skeleton } from '@patternfly/react-core'
import usePluginInstanceResource from './usePluginInstanceResource'
import { SpinContainer } from '../../common/loading/LoadingContent'

const StatusTitle = () => {
  const pluginInstanceResource = usePluginInstanceResource()

  let statusTitle:
    | {
        title: string
        icon: any
      }
    | undefined = undefined
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus

  if (pluginStatus) {
    statusTitle = getCurrentTitleFromStatus(pluginStatus)
  }

  if (statusTitle) {
    return (
      <>
        <span>{<statusTitle.icon />}</span>
        <span>{statusTitle.title} </span>{' '}
      </>
    )
  } else return <SpinContainer title="Fetching plugin's execution status" />
}

export default React.memo(StatusTitle)

export function getCurrentTitleFromStatus(statusLabels: any[]) {
  const length = statusLabels.length
  let title = statusLabels[length - 1].description
  let icon = statusLabels[length - 1].icon
  statusLabels.forEach((label) => {
    if (label.process === true) {
      title = label.description
      icon = label.icon
    }
  })

  return { title, icon }
}
