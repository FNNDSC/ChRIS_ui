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
import { useTypedSelector } from '../../../../store/hooks'

type Paginate = {
  limit: number
  offset: number
  fname_icontains: string
}

const lookDeeper = async (
  path: string,
  value: string,
  maxDepth: number,
  type: string,
) => {
  const client = ChrisAPIClient.getClient()
  const results: string[] = []
  if (maxDepth < 0) return []
  const subpaths = await client.getFileBrowserPath(path)
  console.log('Subpaths', subpaths)
  if (
    subpaths &&
    subpaths.data &&
    subpaths.data.subfolders &&
    subpaths.data.subfolders.length > 0
  ) {
    const subfolders = subpaths.data.subfolders
    let folders

    folders = subfolders.split(',')
    if (maxDepth === 5 && type === 'feed') {
      folders = folders.filter((folder: string) => folder !== 'uploads')
    }

    if (maxDepth === 5 && type === 'pacs') {
      folders = folders.filter((folder: string) => folder === 'SERVICES')
    }

    if (folders.length > 0) {
      for (let i = 0; i < folders.length; i++) {
        if (folders[i] === value || folders[i].includes(value)) {
          if (type === 'feed') results.push(`${path}/${folders[i]}`)
          if (type === 'pacs') results.push(`${path}/${folders[i]}`)
          if (type === 'uploads') results.push(`${path}/${folders[i]}`)
        }
      }

      for (let i = 0; i < folders.length; i++) {
        const newPath =
          maxDepth === 5 && type === 'pacs'
            ? `${folders[i]}`
            : `${path}/${folders[i]}`
        const recursed: string[] = await lookDeeper(
          newPath,
          value,
          maxDepth - 1,
          type,
        )
        results.push(...recursed)
      }
    }
  }

  return results
}

const searchFeedFiles = async (value: string, path: string) => {
  const maxDepth = 5
  const results = await lookDeeper(path, value, maxDepth, 'feed')
  return results
}

const searchPacsFiles = async (value: string, path: string) => {
  const maxDepth = 5
  const results = await lookDeeper(path, value, maxDepth, 'pacs')
  return results
}

const searchUploadedFiles = async (value: string, path: string) => {
  const maxDepth = 5
  const results = await lookDeeper(path, value, maxDepth, 'uploads')
  return results
}

const Search = () => {
  const { dispatch } = useContext(LibraryContext)
  const username = useTypedSelector((state) => state.user.username)
  const [value, setValue] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [emptySet, setEmptySet] = React.useState('')

  const handleSearch = async () => {
    if (value && username) {
      setLoading(true)

      const client = ChrisAPIClient.getClient()
      const uploadedFiles = await searchUploadedFiles(
        value,
        `${username}/uploads`,
      )
      const feedFiles = await searchFeedFiles(value, username)
      const pacsFiles = await searchPacsFiles(value, '')

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
          const names = file.split('/')

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
        const path = username
        const feedFolders: string[] = []
        feedFiles.forEach((file: any) => {
          const folder = file.split('/')[1]
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
          const fileName = file.split('/')
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
