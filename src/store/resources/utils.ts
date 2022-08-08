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
    'started',
    'transmitting',
    'computing',
    'receiving',
    'registeringFiles',
    'finishedSuccessfully',
  ]

  const pluginStatus = pluginDetails.data.status
  const currentLabel = statusLabels.indexOf(pluginStatus)
  console.log('STATUS', pluginStatus, currentLabel)

  const waitingStatus = currentLabel > 0 ? true : false

  const error =
    pluginStatus === 'finishedWithError' || pluginStatus === 'cancelled'

  const computeError = [
    'finishedSuccessfully',
    'finishedWithError',
    'cancelled',
  ].includes(labels?.compute.return.job_status)
    ? true
    : false

  status[0] = {
    id: 1,
    title: `${pluginStatus === 'created' ? 'Created' : 'Waiting'}`,
    status: waitingStatus,
    isCurrentStep:
      pluginStatus === 'waiting' || pluginStatus === 'created' ? true : false,
    error: false,
    description: 'Waiting',
    icon: AiFillClockCircle,
  }

  status[1] = {
    id: 2,
    title: 'Transmitting',
    status: labels && labels.pushPath.status === true ? true : false,
    isCurrenStep:
      pluginStatus === 'started' && labels?.pushPath.status !== true
        ? true
        : false,
    error,
    description: 'Transmitting',
    icon: MdOutlineDownloading,
  }

  status[2] = {
    id: 3,
    title: 'Computing',
    status:
      labels?.compute.return.status === true &&
      labels?.compute.submit.status === true,

    isCurrentStep:
      labels?.compute.return.status !== true &&
      labels?.compute.submit.status !== true &&
      labels?.pushPath.status === true,
    error,
    description: 'Computing',
    icon: AiFillRightCircle,
  }

  status[3] = {
    id: 4,
    title: 'Receiving',
    status: labels?.pullPath.status === true ? true : false,
    isCurrentStep:
      labels?.compute.return.status === true && labels?.pullPath.status !== true
        ? true
        : false,
    error: computeError,
    description: 'Receiving',
    icon: AiFillLeftCircle,
  }

  status[4] = {
    id: 5,
    title: 'Registering',
    status: labels?.pullPath.status === true || currentLabel > 5 ? true : false,
    isCurrentStep:
      pluginStatus === 'registeringFiles' && labels?.pullPath.status === true,
    error,
    description: 'Registering',
    icon: FaFileArchive,
  }

  const cancelledStatus =
    pluginStatus === 'cancelled' ||
    pluginStatus === 'finishedWithError' ||
    pluginStatus === 'finishedSuccessfully'
      ? true
      : false

  status[5] = {
    id: 6,
    title: `${
      pluginStatus === 'finishedWithError'
        ? `Finished With Error`
        : pluginStatus === 'cancelled'
        ? 'Cancelled'
        : 'Finished Successfully'
    }`,
    status: cancelledStatus,
    isCurrentStep: cancelledStatus,
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
  }

  console.log('STATUS', status)
  return status
}
