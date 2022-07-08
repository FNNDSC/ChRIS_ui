import React, { useContext } from 'react'
import { Label, Button } from '@patternfly/react-core'
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
  setCurrentSearchFolder,
  setCurrentSearchFiles,
  clearSearchFilter,
  backToSearchResults,
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

    search,
  } = state

  const resourcesFetch = React.useCallback(
    async (path: string) => {
      const client = ChrisAPIClient.getClient()
      const uploads = await client.getFileBrowserPaths({
        path,
      })
      if (search[type] === true) {
        dispatch(setCurrentPathSearch(path, type))
      } else {
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
          dispatch(setCurrentSearchFolder(folders, path, type))
        } else {
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
      if (files && files.length > 0) {
        if (search[type]) {
          dispatch(setCurrentSearchFiles(files, path, type))
        } else {
          dispatch(setFiles(files, path))
        }

        const currentFolderSplit = path.split('/')
        const currentFolder = currentFolderSplit[currentFolderSplit.length - 1]
        const totalCount = fileList.totalCount
        dispatch(setFolderDetails(totalCount, currentFolder))
      }
    }
  }

  const togglePreview = () => {
    dispatch(setTogglePreview(!previewAll))
  }
  return (
    <>
      {search[type] === true && (
        <Label
          color="blue"
          icon
          onClose={() => {
            dispatch(clearSearchFilter(type))
          }}
        >
          Clear Search Filter
        </Label>
      )}

      {search[type] === true ? (
        <div>
          <SearchContainer
            togglePreview={togglePreview}
            handleFolderClick={handleFolderClick}
            type={type}
          />
        </div>
      ) : (
        <>
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
      )}
    </>
  )
}

export default React.memo(BrowserContainer)

export const SearchContainer = ({
  type,
  handleFolderClick,
  togglePreview,
}: {
  type: string
  handleFolderClick: (path: string) => void
  togglePreview: () => void
}) => {
  const { state, dispatch } = useContext(LibraryContext)
  const {
    searchedFoldersState,
    currentSearchFiles,
    currentSearchFolders,
    folderDetails,
    previewAll,
    searchPath,
  } = state

  const resources = searchedFoldersState[type]
  const currentPath = searchPath[type]
  const searchFolders =
    currentSearchFolders[type] && currentSearchFolders[type][currentPath]
  const files =
    currentSearchFiles[type] && currentSearchFiles[type][currentPath]

  return (
    <>
      {searchPath[type] ? (
        <div
          style={{ display: 'flex', flexDirection: 'column', marginTop: '1em' }}
        >
          <div>
            <Button
              variant="tertiary"
              onClick={() => {
                dispatch(backToSearchResults(type))
              }}
            >
              <b>Back to Search Results</b>
            </Button>
          </div>

          <BreadcrumbContainer
            path={currentPath}
            handleFolderClick={handleFolderClick}
            browserType={type}
            files={files}
            folderDetails={folderDetails}
            previewAll={previewAll}
            togglePreview={togglePreview}
          />
          <Browser
            handleFolderClick={handleFolderClick}
            folders={searchFolders}
            files={files}
            browserType={type}
          />
        </div>
      ) : (
        resources.map((resource, index) => {
          const path = Object.getOwnPropertyNames(resource)[0]
          const folders = resource[path]

          return (
            <div key={index}>
              <BreadcrumbContainer
                path={path}
                handleFolderClick={handleFolderClick}
                browserType={type}
                files={[]}
                folderDetails={folderDetails}
                previewAll={previewAll}
                togglePreview={togglePreview}
              />
              <Browser
                handleFolderClick={handleFolderClick}
                folders={folders}
                files={[]}
                browserType={type}
              />
            </div>
          )
        })
      )}
    </>
  )
}
