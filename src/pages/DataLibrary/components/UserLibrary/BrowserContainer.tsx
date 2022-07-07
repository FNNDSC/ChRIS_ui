import React, { useContext } from 'react'
import BreadcrumbContainer from './BreadcrumbContainer'
import { Browser } from './Browser'
import { LibraryContext } from './context'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import {
  setCurrentPath,
  setCurrentPathSearch,
  setFolders,
  setFiles,
  setTogglePreview,
  setFolderDetails,
  setSearchedFolders,
} from './context/actions'

interface BrowserContainerInterface {
  type: string
  path: string
  username?: string | null
}

const BrowserContainer = ({
  type,
  path: rootPath,
}: BrowserContainerInterface) => {
  const { state, dispatch } = useContext(LibraryContext)

  const {
    foldersState,
    currentPath,
    filesState,
    folderDetails,
    previewAll,
    searchedFoldersState,
    search,
    searchPath
  } = state

  const resourcesFetch = React.useCallback(
    async (path: string) => {
      const client = ChrisAPIClient.getClient()
      const uploads = await client.getFileBrowserPaths({
        path,
      })
      if (search[type] === true) {
        dispatch(setCurrentPathSearch([path], type))
      }
      else {
        dispatch(setCurrentPath(path, type))
      }

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

        folders = folders.map((folder: string) => {
          return {
            name: folder,
            path: `${path}`,
          }
        })
        if (search[type] === true) {
          dispatch(setSearchedFolders(folders, path))
        }
        else {
          dispatch(setFolders(folders, path))
        }

      }
    },
    [dispatch, type, search],
  )

  React.useEffect(() => {
    async function fetchUploads() {
      resourcesFetch(rootPath)
    }

    if (!search[type]) {
      fetchUploads()
    }

  }, [rootPath, dispatch, resourcesFetch, search, type])

  const handleFolderClick = async (path: string) => {
    const client = ChrisAPIClient.getClient()
    resourcesFetch(path)
    const pagination = {
      limit: 100,
      offset: 0,
      totalCount: 0,
    }
    const pathList = await client.getFileBrowserPath(path)
    const fileList = await pathList.getFiles({
      limit: pagination.limit,
      offset: pagination.offset,
    })

    if (fileList) {
      const files = fileList.getItems()
      if (files) {
        dispatch(setFiles(files, path))
      }
      const currentFolderSplit = path.split('/')
      const currentFolder = currentFolderSplit[currentFolderSplit.length - 1]
      const totalCount = fileList.totalCount
      dispatch(setFolderDetails(totalCount, currentFolder))
    }
  }

  const togglePreview = () => {
    dispatch(setTogglePreview(!previewAll))
  }
  return (
    <>
      {
        search[type] === true ? <div><SearchContainer handleFolderClick={handleFolderClick} type={type} /></div> : <>
          {currentPath[type] &&
            currentPath[type].length > 0 &&
            currentPath[type].map((path, index) => {
              const folders = foldersState[path]
              const files = filesState[path]
              return (
                <div key={index}>
                  <BreadcrumbContainer
                    browserType={type}
                    handleFolderClick={handleFolderClick}
                    path={path}
                    files={files}
                    folderDetails={folderDetails}
                    previewAll={previewAll}
                    togglePreview={togglePreview}
                  />
                  <Browser
                    handleFolderClick={handleFolderClick}
                    folders={folders}
                    files={files}
                    browserType={type}
                  />
                </div>
              )
            })}
        </>
      }
    </>
  )
}

export default React.memo(BrowserContainer)



export const SearchContainer = ({ type, handleFolderClick }: { type: string, handleFolderClick: (path: string) => void }) => {
  const { state, dispatch } = useContext(LibraryContext)
  const { searchedFoldersState, currentSearchFiles, searchPath, currentSearchFolders } = state;
  console.log()

  const currentPath = searchPath[type][0]
  const folders = currentPath ? currentSearchFolders[currentPath] : searchedFoldersState[type]
  const files = currentPath ? currentSearchFiles[currentPath] : []
  return (
    <>
      <SearchBreadcrumbContainer />
      <Browser handleFolderClick={handleFolderClick}
        folders={folders}
        files={files}
        browserType={type}
      />
    </>

  )
}

const SearchBreadcrumbContainer = () => {
  return (
    <div>
      Search Container
    </div>
  )
}