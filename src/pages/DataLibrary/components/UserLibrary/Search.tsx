import React, { useContext } from 'react'
import { Card, TextInput, Button, Spinner } from '@patternfly/react-core'
import { LibraryContext } from './context'
import { useTypedSelector } from '../../../../store/hooks'
import { searchUploadedFiles, searchFeedFiles, searchPacsFiles, handleUploadedFiles, handleFeedFiles, handlePacsFiles } from './utils'

const Search = () => {
  const { dispatch } = useContext(LibraryContext)
  const username = useTypedSelector((state) => state.user.username)
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [emptySet, setEmptySet] = React.useState('')

  const handleSearch = async () => {
    if (value && username) {
      setLoading(true)

      const uploadedFiles = await searchUploadedFiles(
        value,
        `${username}/uploads`,
      )
      const feedFiles = await searchFeedFiles(value, username)
      const pacsFiles = await searchPacsFiles(value, '')

      const isUploadedRoot =
        uploadedFiles.length > 0

      const isFeedRoot =
        feedFiles.length > 0

      const isPacsRoot =
        pacsFiles.length > 0
      if (uploadedFiles && uploadedFiles.length > 0) {
        handleUploadedFiles(uploadedFiles, dispatch, isUploadedRoot, value)
      }

      if (feedFiles && feedFiles.length > 0) {
        handleFeedFiles(feedFiles, dispatch, isFeedRoot, username)
      }

      if (pacsFiles && pacsFiles.length > 0) {
        handlePacsFiles(pacsFiles, dispatch, isPacsRoot,)
      }

      if (
        feedFiles.length === 0 &&
        uploadedFiles.length === 0 &&
        pacsFiles.length === 0
      ) {
        setEmptySet('No dataset found')
      }
      setLoading(false)
      setValue('')
    }
  }

  return (
    <div>
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
        <TextInput
          value={value}
          type="text"
          id="search-value"
          placeholder="Search Library"
          onChange={(value: string) => {
            setValue(value)
            setEmptySet('')
          }}
          aria-label='Search'
        />

        <Button
          style={{
            marginLeft: '0.5em',
          }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Card>
      {loading && (
        <div
          style={{
            marginTop: '1em',
            marginLeft: 'auto'
          }}
        >
          <Spinner
            style={{
              marginRight: '1em',
            }}
            size="md"
          />
          <span>Fetching Search Results....</span>
        </div>
      )}
      {emptySet && <div>No Dataset Found</div>}
    </div>
  )
}

export default React.memo(Search)
