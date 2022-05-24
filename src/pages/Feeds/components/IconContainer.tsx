import React from 'react'
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core'
import { FaTrash, FaDownload } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { downloadFeedRequest, deleteFeed } from '../../../store/feed/actions'
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
        icon={<FaTrash aria-label="feed-action-icon" />}
        onChange={() => {
          dispatch(deleteFeed(bulkSelect));
        }}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={<FaDownload aria-label="feed-action-icon" />}
        onChange={() => {
          dispatch(downloadFeedRequest(bulkSelect));
        }}
      />
    </ToggleGroup>
  );
}

export default IconContainer
