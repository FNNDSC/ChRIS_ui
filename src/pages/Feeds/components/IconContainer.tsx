import React from 'react'
import { ToggleGroup, ToggleGroupItem, Tooltip } from '@patternfly/react-core'
import { FaTrash, FaDownload, } from 'react-icons/fa'
import { VscMerge } from 'react-icons/vsc'
import { useDispatch } from 'react-redux'
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
  toggleSelectAll
} from '../../../store/feed/actions'
import { useTypedSelector } from '../../../store/hooks'

const IconContainer = () => {
  const bulkSelect = useTypedSelector((state) => {
    return state.feed.bulkSelect
  })
  const dispatch = useDispatch()

  const handleChange = (type: string) => {
    type === 'download' && dispatch(downloadFeedRequest(bulkSelect))
    type === 'merge' && dispatch(mergeFeedRequest(bulkSelect))
    type === 'delete' && dispatch(deleteFeed(bulkSelect))
    dispatch(toggleSelectAll());
  }
  return (
    <ToggleGroup aria-label="Feed Action Bar">
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Download selected feeds</div>}>
            <FaDownload />
          </Tooltip>
        }
        onChange={() => handleChange('download')}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Merge selected feeds</div>}>
            <VscMerge style={{
              height: '1.25em',
              width: '1.25em'
            }} />
          </Tooltip>
        }
        onChange={() => handleChange('merge')}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Delete selected feeds</div>}>
            <FaTrash />
          </Tooltip>
        }
        onChange={() => handleChange('delete')}
      />

    </ToggleGroup>
  )
}

export default IconContainer
