import React from 'react'

import { AiFillCheckCircle, AiFillExclamationCircle } from 'react-icons/ai'
import usePluginInstanceResource from './usePluginInstanceResource'
import { SpinContainer } from '../../common/loading/LoadingContent'
import { useTypedSelector } from '../../../store/hooks'

const StatusTitle = () => {
  const pluginInstanceResource = usePluginInstanceResource()
  const selected = useTypedSelector((state) => state.instance.selectedPlugin)

  let statusTitle:
    | {
        title: string
        icon: any
      }
    | undefined
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus

  const finishedStatuses = [
    'finishedSuccessfully',
    'finishedWithError',
    'cancelled',
  ]

  if (pluginStatus) {
    statusTitle =
      selected && finishedStatuses.includes(selected.data.status) === true
        ? getFinishedTitle(selected.data.status)
        : getCurrentTitleFromStatus(pluginStatus)
  }

  if (statusTitle) {
    return (
      <>
        <span><statusTitle.icon /></span>
        <span>{statusTitle.title} </span>{' '}
      </>
    )
  } return <SpinContainer title="Fetching plugin's execution status" />
}

export default React.memo(StatusTitle)

export function getCurrentTitleFromStatus(statusLabels: any[]) {
  const {length} = statusLabels
  let title = statusLabels[length - 1].description
  let {icon} = statusLabels[length - 1]
  statusLabels.forEach((label) => {
    if (label.process === true) {
      title = label.description
      icon = label.icon
    }
  })

  return { title, icon }
}

export function getFinishedTitle(pluginStatus: string) {
  const title =
    pluginStatus === 'finishedSuccessfully'
      ? 'Finished Successfully'
      : pluginStatus === 'cancelled'
      ? 'Cancelled'
      : pluginStatus === 'finishedWithError'
      ? 'FinishedWithError'
      : ''
  const icon =
    pluginStatus === 'finishedSuccessfully'
      ? AiFillCheckCircle
      : pluginStatus === 'cancelled' || pluginStatus === 'finishedWithError'
      ? AiFillExclamationCircle
      : null

  return {
    title,
    icon,
  }
}
