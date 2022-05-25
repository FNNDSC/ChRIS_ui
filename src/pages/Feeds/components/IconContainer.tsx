import React from 'react'
import { ToggleGroup, ToggleGroupItem, Tooltip } from '@patternfly/react-core'
import { FaTrash, FaDownload, FaCodeBranch } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
} from '../../../store/feed/actions'
import { useTypedSelector } from '../../../store/hooks'

const IconContainer = () => {
  const bulkSelect = useTypedSelector((state) => {
    return state.feed.bulkSelect
  })
  const dispatch = useDispatch()
  return (
    <ToggleGroup aria-label="Feed Action Bar">
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Download selected feeds</div>}>
            <FaDownload />
          </Tooltip>
        }
        onChange={() => {
          dispatch(downloadFeedRequest(bulkSelect))
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Merge selected feeds</div>}>
            <FaCodeBranch />
          </Tooltip>
        }
        onChange={() => {
          dispatch(mergeFeedRequest(bulkSelect))
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Delete selected feeds</div>}>
            <FaTrash />
          </Tooltip>
        }
        onChange={() => {
          dispatch(deleteFeed(bulkSelect))
        }}
      />

    </ToggleGroup>
  )
}

export default IconContainer
