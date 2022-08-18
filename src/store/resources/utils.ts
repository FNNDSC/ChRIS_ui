import { PluginStatusLabels } from './types'
import { GrInProgress } from 'react-icons/gr'
import {
  AiFillRightCircle,
  AiFillLeftCircle,
  AiFillClockCircle,
} from 'react-icons/ai'
import { FaFileArchive } from 'react-icons/fa'
import { MdOutlineDownloading } from 'react-icons/md'

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any,
  previousStatus: string,
) {
  const status = []
  const pluginStatus = pluginDetails.data.status

  const startState =
    pluginStatus === 'scheduled' || pluginStatus === 'started'
      ? pluginStatus
      : 'started'

  const steps = [
    'waiting',
    startState,
    'transmit',
    'compute',
    'syncData',
    'registeringFiles',
  ]

  const currentLabel = steps.indexOf(pluginStatus)

  const errorStatuses = ['finishedWithError', 'cancelled']
  const error = errorStatuses.includes(pluginStatus)
  const finishedStatuses = [...errorStatuses, 'finishedSuccessfully']
  let waitingStatus = false
  if (pluginDetails.data.plugin_type === 'fs') {
    waitingStatus =
      currentLabel > 0 || finishedStatuses.includes(pluginStatus) ? true : false
  } else {
    waitingStatus =
      currentLabel > 0 ||
      (finishedStatuses.includes(pluginStatus) &&
        previousStatus === 'finishedSuccessfully')
        ? true
        : false
  }

  status[0] = {
    description: 'Waiting',
    process: pluginStatus === 'waiting' ? true : false,
    wait: finishedStatuses.includes(previousStatus) === true ? true : false,
    finish: waitingStatus,
    error:
      previousStatus === 'cancelled' || previousStatus === 'finishedWithError',
    icon: AiFillClockCircle,
  }

  status[1] = {
    description: 'Started',
    process:
      (pluginStatus === 'started' || pluginStatus === 'scheduled') && !labels
        ? true
        : false,
    wait: status[0].finish !== true,
    finish: labels && labels.pushPath.status === true ? true : false,
    error: status[0].error ? true : false,
    icon: GrInProgress,
  }

  status[2] = {
    description: 'Transmitting',
    process:
      pluginStatus === 'started' && labels && labels.pushPath.status !== true
        ? true
        : false,
    wait: status[1].finish !== true,
    finish: labels && labels.pushPath.status === true ? true : false,
    error: !labels && error,
    icon: MdOutlineDownloading,
  }

  status[3] = {
    description: 'Computing',
    process:
      pluginStatus === 'started' &&
      status[2].finish &&
      labels &&
      !labels.compute.return.status &&
      !labels.compute.submit.status
        ? true
        : false,
    wait: status[2].finish !== true,
    finish:
      labels &&
      labels.compute.return.status === true &&
      labels.compute.submit.status === true &&
      labels.compute.return.job_status === 'finishedSuccessfully'
        ? true
        : false,
    error:
      labels && errorStatuses.includes(labels?.compute.return.job_status)
        ? true
        : false,
    icon: AiFillRightCircle,
  }

  status[4] = {
    description: 'Receiving',
    process:
      pluginStatus === 'started' &&
      labels &&
      !labels.pullPath.status &&
      status[3].finish === true
        ? true
        : false,
    wait: status[3].finish !== true,
    finish: labels && labels.pullPath.status === true,
    error: !labels && error,
    icon: AiFillLeftCircle,
  }

  status[5] = {
    description: 'Registering Files',
    process:
      pluginStatus === 'registeringFiles' &&
      status[4].finish &&
      currentLabel > 1,
    wait: status[4].finish !== true,
    finish:
      labels &&
      labels.pullPath.status === true &&
      finishedStatuses.includes(pluginStatus) === true
        ? true
        : false,
    error: error,
    icon: FaFileArchive,
  }

  console.log('Status', status)

  return status
}
