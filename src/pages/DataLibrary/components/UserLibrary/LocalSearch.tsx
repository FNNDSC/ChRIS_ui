import React, { useContext } from 'react'
import { TextInput, Button, Spinner } from '@patternfly/react-core'
import {
  searchUploadedFiles,
  searchFeedFiles,
  searchPacsFiles,
  handleUploadedFiles,
  handleFeedFiles,
  handlePacsFiles,
} from './utils'
import { LibraryContext } from './context'

const LocalSearch = ({
  type,
  username,
}: {
  type: string
  username: null | undefined | string
}) => {
  const [value, setValue] = React.useState('')
  const { dispatch } = useContext(LibraryContext)
  const [loading, setLoading] = React.useState(false)

  const handleChange = (value: string) => {
    setValue(value)
  }

  const placeholder =
    type === 'uploads'
      ? 'Search over Uploads'
      : type === 'feed'
      ? 'Search over Completed Analyses'
      : 'Search over SERVICES/PACS'

  const handleSubmit = async () => {
    if (value && username) {
      if (type === 'uploads') {
        setLoading(true)
        const uploadedFiles = await searchUploadedFiles(
          value.toLowerCase(),
          `${username}/uploads`,
        )

        if (uploadedFiles && uploadedFiles.length > 0) {
          handleUploadedFiles(uploadedFiles, dispatch, value.toLowerCase())
        }
        setLoading(false)
      }
      if (type === 'feed') {
        setLoading(true)
        const feedFiles = await searchFeedFiles(value.toLowerCase(), username)
        if (feedFiles && feedFiles.length > 0) {
          handleFeedFiles(feedFiles, dispatch, username)
        }
        setLoading(false)
      }
      if (type === 'services') {
        setLoading(true)
        const pacsFiles = await searchPacsFiles(value.toLowerCase(), '')
        if (pacsFiles && pacsFiles.length > 0) {
          handlePacsFiles(pacsFiles, dispatch)
        }
        setLoading(false)
      }
    }
  }
  return (
    <>
      <div
        style={{
          width: '60%',
          display: 'flex',
          margin: 'auto',
        }}
      >
        <TextInput
          style={{
            marginRight: '1em',
          }}
          iconVariant="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit}>Search</Button>
      </div>

      <div
        style={{
          marginTop: '1em',
          height: '1em',
        }}
      >
        {loading && (
          <>
            {' '}
            <Spinner
              style={{
                marginRight: '1em',
              }}
              size="md"
            />
            <span>Performing Search... <i>please wait</i></span>
          </>
        )}
      </div>
    </>
  )
}

export default LocalSearch
