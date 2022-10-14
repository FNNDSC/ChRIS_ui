import { PluginStatusLabels } from './types'
import { GrInProgress } from 'react-icons/gr'
import { AiFillRightCircle, AiFillLeftCircle, AiFillClockCircle } from 'react-icons/ai'
import { FaFileArchive } from 'react-icons/fa'
import { MdOutlineDownloading } from 'react-icons/md'

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any,
  previousStatus: string
) {
  const status = []
  const pluginStatus = pluginDetails.data.status
  const errorStatuses = ['finishedWithError', 'cancelled']
  const finishedStatuses = [...errorStatuses, 'finishedSuccessfully']

  const startState =
    pluginStatus === 'scheduled' || pluginStatus === 'started' ? pluginStatus : 'started'

  const endState = finishedStatuses.includes(pluginStatus) ? pluginStatus : 'Waiting To Finish'

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

  let waitingStatus = false
  if (pluginDetails.data.plugin_type === 'fs') {
    waitingStatus = currentLabel > 0 ? true : false
  } else {
    waitingStatus = currentLabel > 0 && previousStatus === 'finishedSuccessfully' ? true : false
  }

  status[0] = {
    description: 'Waiting',
    process: pluginStatus === 'waiting' ? true : false,
    wait: false,
    finish: waitingStatus,
    error:
      errorStatuses.includes(pluginStatus) && errorStatuses.includes(previousStatus) ? true : false,
    icon: AiFillClockCircle,
  }

  status[1] = {
    description: 'Started',
    process: ['scheduled', 'created', 'started'].includes(pluginStatus) && !labels ? true : false,
    wait: status[0].finish !== true,
    finish: (labels && labels.pushPath.status === true) || currentLabel === 6 ? true : false,
    error: false,
    icon: GrInProgress,
  }

  status[2] = {
    description: 'Transmitting',
    process: pluginStatus === 'started' && labels && labels.pushPath.status !== true ? true : false,
    wait: !labels || status[1].finish !== true,
    finish: labels && labels.pushPath.status === true ? true : false,
    error:
      labels && labels.pushPath.status !== true && errorStatuses.includes(pluginStatus)
        ? true
        : false,
    icon: MdOutlineDownloading,
  }

  status[3] = {
    description: 'Computing',
    process:
      pluginStatus === 'started' &&
      status[2].finish &&
      labels &&
      labels.compute.submit.status &&
      !labels.compute.return.status
        ? true
        : false,
    wait: !labels || status[2].finish !== true,
    finish:
      labels &&
      labels.compute.return.status === true &&
      labels.compute.submit.status === true &&
      finishedStatuses.includes(labels.compute.return.job_status)
        ? true
        : false,
    error:
      (labels && errorStatuses.includes(labels.compute.return.job_status)) ||
      (labels &&
        labels.compute.return.status !== true &&
        errorStatuses.includes(pluginStatus) &&
        labels.pushPath.status === true)
        ? true
        : false,
    icon: AiFillRightCircle,
  }

  status[4] = {
    description: 'Receiving',
    process:
      pluginStatus === 'started' && labels && !labels.pullPath.status && status[3].finish === true
        ? true
        : false,
    wait: !labels || status[3].finish !== true,
    finish: labels && labels.pullPath.status === true,
    error: false,
    icon: AiFillLeftCircle,
  }

  status[5] = {
    description: 'Registering Files',
    process: pluginStatus === 'registeringFiles' && status[4].finish && currentLabel > 1,
    wait: status[4].finish !== true,
    finish:
      labels && labels.pullPath.status === true && finishedStatuses.includes(pluginStatus) === true
        ? true
        : false,
    error: false,
    icon: FaFileArchive,
  }

  return status
}
