import { PluginStatusLabels } from './types'
import { GrInProgress } from 'react-icons/gr'
import {
  AiFillRightCircle,
  AiFillLeftCircle,
  AiFillClockCircle,
  AiFillCheckCircle,
} from 'react-icons/ai'
import { FaFileArchive } from 'react-icons/fa'
import { MdError, MdOutlineDownloading } from 'react-icons/md'

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any,
  previousStatus: string,
) {
  const status = []
  const pluginStatus = pluginDetails.data.status

  const endState =
    pluginStatus === 'finishedWithError' ||
    pluginStatus === 'cancelled' ||
    pluginStatus === 'finishedSuccessfully'
      ? pluginStatus
      : 'waitingToFinish'

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
    endState,
  ]

  const currentLabel = steps.indexOf(pluginStatus)

  const errorStatuses = ['finishedWithError', 'cancelled']
  const error = errorStatuses.includes(pluginStatus)
  const finishedStatuses = [...errorStatuses, 'finishedSuccessfully']
  let waitingStatus = false
  if (pluginDetails.data.plugin_type === 'fs') {
    waitingStatus = currentLabel > 0 ? true : false
  } else {
    waitingStatus =
      currentLabel > 0 && previousStatus === 'finishedSuccessfully'
        ? true
        : false
  }

  status[0] = {
    description: 'Waiting',
    process: pluginStatus === 'waiting',
    wait: !finishedStatuses.includes(previousStatus),
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
    finish: currentLabel === 6 || (labels && labels.pushPath.status === true),
    error: error,
    icon: GrInProgress,
  }

  status[2] = {
    description: 'Transmitting',
    process:
      pluginStatus === 'started' &&
      labels &&
      labels.pushPath.status !== true &&
      currentLabel < 5
        ? true
        : false,
    wait: status[1].finish !== true,
    finish:
      currentLabel === 6 || (labels && labels.pushPath.status === true)
        ? true
        : false,
    error: !labels && error,
    icon: MdOutlineDownloading,
  }

  status[3] = {
    description: 'Computing',
    process:
      pluginStatus === 'started' &&
      status[2].finish &&
      ((labels && !labels.compute.return.status) ||
        !labels.compute.submit.status)
        ? true
        : false,
    wait: status[2].finish !== true,
    finish:
      currentLabel === 6 ||
      (labels &&
        labels.compute.return.status &&
        labels.compute.submit.status &&
        ['finishedSuccessfully', 'finishedWithError', 'cancelled'].includes(
          labels?.compute.return.job_status,
        ))
        ? true
        : false,
    error: !labels && error,
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
    finish: currentLabel === 6 || (labels && labels.pullPath.status === true),
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
    finish: currentLabel === 6 && labels && labels.pullPath.status === true,
    error: error,
    icon: FaFileArchive,
  }

  status[6] = {
    description:
      pluginStatus === 'finishedSuccessfully'
        ? 'Finished Successfully'
        : pluginStatus === 'cancelled'
        ? 'Cancelled'
        : pluginStatus === 'finishedWithError'
        ? 'Finished With Error'
        : 'Waiting to Finish',
    process: false,
    wait: status[5].finish !== true,
    finish: currentLabel === 6 && finishedStatuses.includes(pluginStatus),
    error: error,
    icon:
      pluginStatus === 'finishedSuccessfully'
        ? AiFillCheckCircle
        : pluginStatus === 'cancelled' || pluginStatus === 'finishedWithError'
        ? MdError
        : null,
  }

  console.log('STATUS', labels, pluginStatus, status)

  return status
}
