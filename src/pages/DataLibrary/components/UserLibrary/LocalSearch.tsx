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
import { debounce } from 'lodash'
import {
  clearSearchFilter,
  setEmptySetIndicator,
  setSearch,
} from './context/actions'

const LocalSearch = ({
  type,
  username,
}: {
  type: string
  username: null | undefined | string
}) => {
  const [value, setValue] = React.useState<{ [key: string]: string }>({
    services: '',
    feed: '',
    uploads: '',
  })

  const { dispatch } = useContext(LibraryContext)
  const [loading, setLoading] = React.useState<{ [key: string]: boolean }>({
    services: false,
    uploads: false,
    feed: false,
  })

  const handleChange = (valueChanged: string) => {
    setValue({
      ...value,
      [type]: valueChanged,
    })
  }

  const placeholder =
    type === 'uploads'
      ? 'Search over Uploads'
      : type === 'feed'
      ? 'Search over Completed Analyses'
      : 'Search over SERVICES/PACS'

  const handleSubmit = async () => {
    if (value[type] && username) {
      dispatch(clearSearchFilter(type))
      dispatch(setSearch(type))
      if (type === 'uploads') {
        setLoading({
          ...loading,
          uploads: true,
        })
        const uploadedFiles = await searchUploadedFiles(
          value[type].toLowerCase(),
        )

        if (uploadedFiles && uploadedFiles.length > 0) {
          handleUploadedFiles(uploadedFiles, dispatch)
        } else {
          dispatch(setEmptySetIndicator('uploaded', true))
        }
        setLoading({
          ...loading,
          uploads: false,
        })
      }
      if (type === 'feed') {
        setLoading({
          ...loading,
          feed: true,
        })
        const feedFiles = await searchFeedFiles(value[type].toLowerCase())
        if (feedFiles && feedFiles.length > 0) {
          handleFeedFiles(feedFiles, dispatch)
        } else {
          dispatch(setEmptySetIndicator('feed', true))
        }
        setLoading({
          ...loading,
          feed: false,
        })
      }
      if (type === 'services') {
        setLoading({
          ...loading,
          services: true,
        })
        const pacsFiles = await searchPacsFiles(value[type].toLowerCase())
        if (pacsFiles && pacsFiles.length > 0) {
          handlePacsFiles(pacsFiles, dispatch)
        } else {
          dispatch(setEmptySetIndicator('services', true))
        }
        setLoading({
          ...loading,
          services: false,
        })
      }
    }
  }

  const debouncedHandleSubmit = debounce(() => {
    handleSubmit()
  }, 500)
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
          value={value[type]}
          onChange={handleChange}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              debouncedHandleSubmit()
            }
          }}
        />
        <Button onClick={handleSubmit}>Search</Button>
      </div>

      <div
        style={{
          marginTop: '1em',
          height: '1em',
        }}
      >
        {loading[type] && (
          <>
            {' '}
            <Spinner
              style={{
                marginRight: '1em',
              }}
              size="md"
            />
            <span>
              Performing Search... <i>please wait</i>
            </span>
          </>
        )}
      </div>
    </>
  )
}

export default LocalSearch
