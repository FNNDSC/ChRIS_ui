import React, { useContext } from 'react'
import { TextInput, Button, Spinner, Label } from '@patternfly/react-core'
import { debounce } from 'lodash'
import {
  searchUploadedFiles,
  searchFeedFiles,
  searchPacsFiles,
  handleUploadedFiles,
  handleFeedFiles,
  handlePacsFiles,
} from './utils'
import { LibraryContext } from './context'
import { clearSearchFilter, setEmptySetIndicator, setSearch } from './context/actions'

const LocalSearch = ({ type, username }: { type: string; username: null | undefined | string }) => {
  const [value, setValue] = React.useState<{ [key: string]: string }>({
    services: '',
    feed: '',
    uploads: '',
  })

  const { dispatch, state } = useContext(LibraryContext)
  const [loading, setLoading] = React.useState<{ [key: string]: boolean }>({
    services: false,
    uploads: false,
    feed: false,
  })
  const { search } = state

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
        const uploadedFiles = await searchUploadedFiles(value[type].toLowerCase(), dispatch)

        if (uploadedFiles && uploadedFiles.length > 0) {
          handleUploadedFiles(uploadedFiles, dispatch)
        } else {
          dispatch(
            setEmptySetIndicator(
              'uploads',
              `We couldn't find anything for the search term ${value[type]}`
            )
          )
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
        const feedFiles = await searchFeedFiles(value[type].toLowerCase(), dispatch)
        if (feedFiles && feedFiles.length > 0) {
          handleFeedFiles(feedFiles, dispatch)
        } else {
          dispatch(
            setEmptySetIndicator(
              'feed',
              `We couldn't find anything for the search term ${value[type]}`
            )
          )
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
        const pacsFiles = await searchPacsFiles(value[type].toLowerCase(), dispatch)
        if (pacsFiles && pacsFiles.length > 0) {
          handlePacsFiles(pacsFiles, dispatch)
        } else {
          dispatch(
            setEmptySetIndicator(
              'services',
              `We couldn't find anything for the search term ${value[type]}`
            )
          )
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
          aria-label="local-search"
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
      {search[type] && (
        <Label
          style={{
            marginTop: '1em',
          }}
          color="blue"
          icon
          onClose={() => {
            setLoading({
              ...loading,
              [type]: false,
            })
            setValue({
              ...value,
              [type]: '',
            })

            dispatch(clearSearchFilter(type))
          }}
        >
          Clear Search Filter
        </Label>
      )}
    </>
  )
}

export default LocalSearch
