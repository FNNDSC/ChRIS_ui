import React from 'react'
import Moment from 'react-moment'
import { Skeleton, Button } from '@patternfly/react-core'
import ShareFeed from '../ShareFeed/ShareFeed'
import { Popover } from 'antd'

import {
  UserIcon,
  CodeBranchIcon,
  CalendarAltIcon,
  PencilAltIcon,
} from '@patternfly/react-icons'
import { useTypedSelector } from '../../../store/hooks'
import './FeedDetails.scss'
import FeedNote from './FeedNote'

const FeedDetails = () => {
  const [note, setNote] = React.useState('')
  const [isNoteVisible, setIsNoteVisible] = React.useState(false)
  const [savingNote, setSavingNote] = React.useState(false)
  const currentFeedPayload = useTypedSelector((state) => state.feed.currentFeed)

  const { data: feed, error, loading } = currentFeedPayload

  React.useEffect(() => {
    async function fetchNode() {
      if (feed) {
        const note = await feed.getNote()
        const { data: noteData } = note
        setNote(noteData.content)
      }
    }
    fetchNode()
  }, [feed])

  const handleEditNote = async (editedNote: string) => {
    setSavingNote(true)
    const note = await feed?.getNote()
    await note?.put({
      title: '',
      content: editedNote,
    })
    setSavingNote(false)
  }

  const handleClose = () => {
    setIsNoteVisible(!isNoteVisible)
  }

  if (feed) {
    return (
      <div className="feed-details">
        <div>
          <span className="detail-text">
            <CodeBranchIcon />
            {feed && <span> {feed.data.name} </span>}
          </span>

          <span className="detail-text">
            <UserIcon size="sm" />{' '}
            {feed && <span> {feed.data.creator_username} </span>}
          </span>

          <span className="detail-text">
            <CalendarAltIcon size="sm" />
            <Moment format="DD MMM YYYY @ HH:mm">
              {feed && feed.data.creation_date}
            </Moment>
          </span>
        </div>
        <div className="buttons-group">
          <Popover
            content={
              <FeedNote
                handleClose={handleClose}
                handleEditNote={handleEditNote}
                note={note}
                status={savingNote}
              />
            }
            placement="bottom"
            visible={isNoteVisible}
            trigger="click"
            onVisibleChange={(visible: boolean) => {
              setIsNoteVisible(visible)
            }}
          >
            <Button
              className="feed-note-button-lg feed-note-button"
              type="button"
              variant="primary"
              icon={<PencilAltIcon />}
            >
              View Feed Note
            </Button>
          </Popover>
          <ShareFeed feed={feed} label="Share Feed" />
        </div>
      </div>
    )
  } else if (loading) {
    return <Skeleton />
  } else if (error) {
    return <div>Error Found</div>
  } else return null
}

export default FeedDetails
