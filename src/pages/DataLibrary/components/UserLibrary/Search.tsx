import React, { useContext } from 'react'
import { Card, TextInput, Button, Spinner } from '@patternfly/react-core'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { fetchResource } from '../../../../utils'
import { LibraryContext } from './context'
import {
  setFolders,
  setInitialPath,
  setPaginatedFolders,
  setPagination,
  setRoot,
} from './context/actions'

const Search = () => {
  const { dispatch, state } = useContext(LibraryContext)
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [emptySet, setEmptySet] = React.useState('')
  console.log('STATE', state)

  const handleSearch = async () => {
    setLoading(true)
    const paginate = {
      limit: 100,
      offset: 0,
      fname_icontains: value,
    }

    const client = ChrisAPIClient.getClient()
    const uploadFn = client.getUploadedFiles
    const feedfn = client.getFiles
    const servicesfn = client.getServiceFiles
    const pacsFn = client.getPACSFiles

    const boundUploadFn = uploadFn.bind(client)
    const boundFeedFn = feedfn.bind(client)
    const boundServicesFn = servicesfn.bind(client)
    const boundPacsFn = pacsFn.bind(client)

    const uploadedFiles = await fetchResource(paginate, boundUploadFn)
    const feedFiles = await fetchResource(paginate, boundFeedFn)
    const servicesFiles = await fetchResource(paginate, boundServicesFn)
    const pacsFiles = await fetchResource(paginate, boundPacsFn)

    const isUploadedRoot =
      uploadedFiles.length > 0 &&
      feedFiles.length === 0 &&
      pacsFiles.length === 0

    const isFeedRoot =
      feedFiles.length > 0 &&
      uploadedFiles.length === 0 &&
      pacsFiles.length === 0

    const isPacsRoot =
      pacsFiles.length > 0 &&
      uploadedFiles.length === 0 &&
      feedFiles.length === 0

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFolders: string[] = []
      let path = ''

      uploadedFiles.forEach((file: any) => {
        const names = file.data.fname.split('/')

        const index = names.findIndex((name: any, index: number) => {
          if (name.toLowerCase() === value.toLowerCase()) {
            return index
          }
        })

        if (index !== -1) {
          path = `${names[0]}/${names[1]}`
          const folder = index === 2 ? names[index] : names[index - 1]
          if (!uploadedFolders.includes(folder)) uploadedFolders.push(folder)
        }
      })

      if (uploadedFolders.length > 0) {
        dispatch(setFolders(uploadedFolders, path))
        dispatch(setInitialPath(path, 'uploads'))
        dispatch(setPaginatedFolders([], path))
        dispatch(
          setPagination(path, {
            hasNext: false,
            limit: 30,
            offset: 0,
            totalCount: 0,
          }),
        )
        if (isUploadedRoot) {
          dispatch(setRoot(true, 'uploads'))
        }
      }
    }
    if (feedFiles && feedFiles.length > 0) {
      const path = 'chris'

      const feedFolders: string[] = []
      feedFiles.forEach((file: any) => {
        const folder = file.data.fname.split('/')[1]
        if (!feedFolders.includes(folder)) feedFolders.push(folder)
      })

      if (feedFolders.length > 0) {
        dispatch(setFolders(feedFolders, path))
        dispatch(setInitialPath(path, 'feed'))
        dispatch(setPaginatedFolders([], path))
        dispatch(
          setPagination(path, {
            hasNext: false,
            limit: 30,
            offset: 0,
            totalCount: 0,
          }),
        )
        if (isFeedRoot) {
          dispatch(setRoot(true, 'feed'))
        }
      }
    }

    if (pacsFiles && pacsFiles.length > 0) {
      const pacsFolders: string[] = []
      const pacsDict: {
        [key: string]: string[]
      } = {}
      pacsFiles.forEach((file: any) => {
        const fileName = file.data.fname.split('/')
        const folder = fileName[3]
        const path = `${fileName[0]}/${fileName[1]}/${fileName[2]}`
        if (!pacsFolders.includes(folder)) {
          pacsFolders.push(folder)
          pacsDict[path] = folder
        }
      })

      for (const i in pacsDict) {
        dispatch(setFolders([pacsDict[i]], i))
        dispatch(setInitialPath(i, 'services'))
      }

      if (pacsFolders.length > 0) {
        dispatch(setPaginatedFolders([], 'SERVICES'))
        dispatch(
          setPagination('SERVICES', {
            hasNext: false,
            limit: 30,
            offset: 0,
            totalCount: 0,
          }),
        )
        if (isPacsRoot) {
          dispatch(setRoot(true, 'services'))
        }
      }
    }

    if (
      feedFiles.length === 0 &&
      uploadedFiles.length === 0 &&
      servicesFiles.length === 0 &&
      pacsFiles.length === 0
    ) {
      setEmptySet('No dataset found')
    }
    setLoading(false)
    setValue('')
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
        <>
          <Spinner size="md" />
          <span>Fetching Search Results....</span>
        </>
      )}
      {emptySet && <div>No Dataset Found</div>}
    </div>
  )
}

export default React.memo(Search)
