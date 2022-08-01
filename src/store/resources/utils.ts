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

  const statusLabels = [
    'waiting',
    'scheduled',
    'started',
    'compute',
    'syncData',
    'registeringFiles',
    'finishedSuccessfully',
    'finishedWithError',
    'cancelled',
  ]
  const pluginStatus = pluginDetails.data.status

  const error =
    pluginStatus === 'finishedWithError' || pluginStatus === 'cancelled'
      ? true
      : false

  const currentLabel = statusLabels.indexOf(pluginStatus)
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
    id: 1,
    title: `${pluginStatus === 'created' ? 'Created' : 'Waiting'}`,
    status: waitingStatus,
    isCurrentStep:
      pluginStatus === 'waiting' || pluginStatus === 'created' ? true : false,
    error,
    description: 'Waiting',
    icon: AiFillClockCircle,
    processError: false,
  }

  status[1] = {
    id: 2,
    title: 'Scheduling',
    status: currentLabel > 1 && status[0].status === true ? true : false,
    isCurrentStep: pluginStatus === 'scheduled' ? true : false,
    error,
    description: 'Scheduling',
    icon: GrInProgress,
    processError: status[0].status !== true && !labels && !error ? true : false,
  }

  status[2] = {
    id: 3,
    title: 'Transmitting',
    status: labels && labels.pushPath.status === true ? true : false,
    isCurrenStep:
      pluginStatus === 'started' && labels?.pushPath.status !== true
        ? true
        : false,
    error,
    description: 'Transmitting',
    icon: MdOutlineDownloading,
    processError: status[1].status !== true && !labels && !error ? true : false,
  }

  status[3] = {
    id: 4,
    title: 'Computing',
    status:
      labels?.compute.return.status === true &&
      labels?.compute.submit.status === true &&
      ['finishedSuccessfully', 'finishedWithError', 'cancelled'].includes(
        labels?.compute.return.job_status,
      )
        ? true
        : false,
    isCurrentStep:
      labels &&
      (labels.compute.return.status !== true ||
        labels.compute.submit.status !== true) &&
      currentLabel > 1 &&
      currentLabel < 6,
    error,
    description: 'Computing',
    icon: AiFillRightCircle,
    processError: status[2].status !== true && !labels && !error ? true : false,
  }

  status[4] = {
    id: 5,
    title: 'Receiving',
    status: labels?.pullPath.status === true ? true : false,
    isCurrentStep:
      labels?.compute.return.status === true &&
      labels?.pullPath.status !== true &&
      currentLabel > 1 &&
      currentLabel < 6,
    error,
    description: 'Receiving',
    icon: AiFillLeftCircle,
    processError: status[3].status !== true && !labels && !error ? true : false,
  }

  status[5] = {
    id: 6,
    title: 'Registering',
    status:
      statusLabels.indexOf(pluginStatus) > 5 && labels?.pullPath.status === true
        ? true
        : false,
    isCurrentStep:
      pluginStatus === 'registeringFiles' &&
      labels.pullPath.status === true &&
      statusLabels.indexOf(pluginStatus) > 2
        ? true
        : false,
    error,
    description: 'Registering',
    icon: FaFileArchive,
    processError: status[4].status !== true && !labels && !error ? true : false,
  }

  status[6] = {
    id: 7,
    title: `${
      pluginStatus === 'finishedWithError'
        ? `Finished With Error`
        : pluginStatus === 'cancelled'
        ? 'Cancelled'
        : 'Finished Successfully'
    }`,
    status:
      pluginStatus === 'cancelled' ||
      pluginStatus === 'finishedWithError' ||
      pluginStatus === 'finishedSuccessfully'
        ? true
        : false,
    isCurrentStep:
      pluginStatus === 'finishedSuccessfully' ||
      pluginStatus === 'cancelled' ||
      pluginStatus === 'finishedWithError'
        ? true
        : false,
    error,
    description:
      pluginStatus === 'finishedSuccessfully'
        ? 'Finished Successfully'
        : pluginStatus === 'cancelled'
        ? 'Cancelled'
        : pluginStatus === 'finishedWithError'
        ? 'Finished With Error'
        : 'Waiting to Finish',
    icon:
      pluginStatus === 'finishedSuccessfully'
        ? AiFillCheckCircle
        : pluginStatus === 'cancelled' || pluginStatus === 'finishedWithError'
        ? MdError
        : null,
    processError: status[5].status !== true && !labels && !error ? true : false,
  }

  return status
}
