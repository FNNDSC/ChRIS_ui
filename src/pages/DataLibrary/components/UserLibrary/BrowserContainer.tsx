import React, { useContext } from 'react'
import BreadcrumbContainer from './BreadcrumbContainer'
import { Browser } from './Browser'
import SpinAlert from './Spin'
import { LibraryContext, Types } from './context'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import {
  setInitialPath,
  setFolders,
  setFiles,
  setPagination,
  setPaginatedFolders,
  clearFolderState,
  clearFilesState,
} from './context/actions'
import { handlePaginatedFolders } from './utils'

const BrowserContainer = ({
  type,
  path: rootPath,
  username,
}: {
  type: string
  path: string
  username?: string | null
}) => {
  const { state, dispatch } = useContext(LibraryContext)
  const {
    filesState,
    foldersState,
    initialPath,
    folderDetails,
    previewAll,
    loading,
    paginated,
    paginatedFolders,
  } = state

  const computedPath = initialPath[type]
  const pagedFolders = paginatedFolders[computedPath]
  const files = filesState[computedPath]
  const folders =
    pagedFolders && pagedFolders.length > 0
      ? pagedFolders
      : foldersState[computedPath]

  const resourcesFetch = React.useCallback(
    async (path: string) => {
      const client = ChrisAPIClient.getClient()
      const uploads = await client.getFileBrowserPaths({
        path,
      })
      dispatch(setInitialPath(path, type))

      const limit = 30

      if (
        uploads.data &&
        uploads.data[0].subfolders &&
        uploads.data[0].subfolders.length > 0
      ) {
        let folders
        const folderSplit = uploads.data[0].subfolders.split(',')

        if (type === 'feed') {
          folders = folderSplit.filter((feed: string) => feed !== 'uploads')
          folders.sort((a: string, b: string) => {
            const aId = parseInt(a.split('_')[1])
            const bId = parseInt(b.split('_')[1])
            return bId - aId
          })
        } else {
          folders = folderSplit
        }

        dispatch(setFolders(folders, path))
        if (folders.length > limit) {
          handlePaginatedFolders(folders, path, dispatch)
          dispatch(
            setPagination(path, {
              hasNext: folders.length > 30,
              limit,
              offset: 0,
              totalCount: folders.length,
            }),
          )
        }
      }
    },
    [dispatch, type],
  )

  React.useEffect(() => {
    async function fetchUploads() {
      resourcesFetch(rootPath)
    }

    fetchUploads()
  }, [rootPath, dispatch, resourcesFetch])

  const handleFolderClick = async (path: string, prevPath: string) => {
    dispatch(clearFolderState(prevPath, type))
    dispatch(clearFilesState(prevPath, type))
    const client = ChrisAPIClient.getClient()
    const pagination = {
      limit: 30,
      offset: 0,
      totalCount: 0,
    }
    resourcesFetch(path);
    const pathList = await client.getFileBrowserPath(path)
    const fileList = await pathList.getFiles({
      limit: pagination.limit,
      offset: pagination.offset,
    })

    if (fileList) {
      const files = fileList.getItems()
      if (files) dispatch(setFiles(files, path))
      dispatch(setInitialPath(path, type))

      if (fileList.hasNextPage) {
        dispatch(
          setPagination(path, {
            limit: pagination.limit,
            offset: pagination.offset,
            hasNext: fileList.hasNextPage,
            totalCount: fileList.totalCount,
          }),
        )
      }

      dispatch(setInitialPath(path, type))
      const currentFolderSplit = path.split('/')
      const currentFolder = currentFolderSplit[currentFolderSplit.length - 1]
      const totalCount = fileList.totalCount
      dispatch({
        type: Types.SET_FOLDER_DETAILS,
        payload: {
          totalCount,
          currentFolder,
        },
      })
    }
  }

  const handlePagination = async (path: string, paginatedType: string) => {
    const offset = (paginated[path].offset += paginated[path].limit)
    const limit = paginated[path].limit
    const totalCount = paginated[path].totalCount
    let hasNext = paginated[path].hasNext

    if (offset < totalCount) {
      if (paginatedType === 'folder') {
        if (paginatedFolders[path]) {
          const newFoldersOffset = foldersState[path].slice(
            offset,
            offset + limit,
          )
          const newFolders = [...paginatedFolders[path], ...newFoldersOffset]
          dispatch(setPaginatedFolders(newFolders, path))
          hasNext = newFolders.length < totalCount
        }
      }

      if (paginatedType === 'file') {
        if (paginated[path]) {
          const client = ChrisAPIClient.getClient()
          const pathList = await client.getFileBrowserPath(path)
          const fileList = await pathList.getFiles({
            limit: limit,
            offset: offset,
          })
          const fetchedFiles = fileList.getItems()
          if (files && fetchedFiles) {
            const sumFiles = [...files, ...fetchedFiles]
            dispatch(setFiles(sumFiles, path))
            hasNext = sumFiles.length < totalCount
          }
        }
      }

      dispatch(
        setPagination(path, {
          offset,
          hasNext,
          limit: paginated[path].limit,
          totalCount: paginated[path].totalCount,
        }),
      )
    }
  }

  const togglePreview = () => {
    dispatch({
      type: Types.SET_PREVIEW_ALL,
      payload: {
        previewAll: !previewAll,
      },
    })
  }

  return (
    <React.Fragment>
      {
        <BreadcrumbContainer
          initialPath={computedPath}
          handleFolderClick={handleFolderClick}
          files={files}
          folderDetails={folderDetails}
          browserType={type}
          togglePreview={togglePreview}
          previewAll={previewAll}
        />
      }

      {loading ? (
        <SpinAlert browserType="feeds" />
      ) : (
        <Browser
          initialPath={computedPath}
          files={files}
          folders={folders}
          handleFolderClick={handleFolderClick}
          paginated={paginated}
          handlePagination={handlePagination}
          previewAll={previewAll}
          browserType={type}
          username={username}
        />
      )}
    </React.Fragment>
  )
}

export default React.memo(BrowserContainer)
