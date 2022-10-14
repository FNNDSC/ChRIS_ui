import React, { useState } from 'react'
import { Feed } from '@fnndsc/chrisapi'
import { Button } from '@patternfly/react-core'
import { FaCodeBranch } from 'react-icons/fa'
import InputUser from './InputUser'
import ShareModal from './ShareModal'
import './sharefeed.scss'

interface ShareFeedProps {
  feed?: Feed
}

const ShareFeed: React.FC<ShareFeedProps> = ({ feed }) => {
  const [showOverlay, setShowOverlay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAddClick = () => setShowOverlay((prev) => !prev)
  const handleCreate = async (username: string) => {
    if (!feed) {
      return
    }
    try {
      setLoading(true)
      await feed.put({
        owner: username,
      })
      setLoading(false)
      setSuccess(true)

      setTimeout(() => {
        handleModalClose()
      }, 2000)
    } catch (error) {
      // @ts-ignore
      setError(error.response.data.owner[0])
      setLoading(false)
    }
  }
  const handleModalClose = () => {
    setShowOverlay((prevState) => !prevState)
    setSuccess(false)
    cleanError()
  }

  const cleanError = () => {
    setError('')
   
  }

  return (
    <>
      <Button
        className="share-feed-button"
        variant="tertiary"
        onClick={handleAddClick}
        icon={<FaCodeBranch />}
        type="button"
      >
        Share Feed
      </Button>
      <ShareModal showOverlay={showOverlay} handleModalClose={handleModalClose}>
        <InputUser
          handleModalClose={handleModalClose}
          handleCreate={handleCreate}
          error={error}
          cleanError={cleanError}
          loading={loading}
          success={success}
        />
      </ShareModal>
    </>
  )
}

export default ShareFeed
