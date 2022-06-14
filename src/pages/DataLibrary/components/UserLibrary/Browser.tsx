import React, { useState, useContext } from 'react'
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Split,
  SplitItem,
  Button,
  Modal,
} from '@patternfly/react-core'
import { FaFile, FaFolder, FaDownload, FaExpand } from 'react-icons/fa'
import FileDetailView from '../../../../components/feed/Preview/FileDetailView'
import { LibraryContext, Paginated, FileSelect, Types } from './context'
import FileViewerModel from '../../../../api/models/file-viewer.model'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { Spin, Tooltip } from 'antd'
import { MdClose } from 'react-icons/md'
import useLongPress from './useLongPress'

interface BrowserInterface {
  initialPath: string
  handleFolderClick: (path: string, prevPath: string) => void
  folders: string[]
  files: any[]
  paginated: {
    [key: string]: Paginated
  }
  handlePagination: (path: string, type: string) => void
  previewAll: boolean

  browserType: string
  username?: string | null
}

export function Browser({
  initialPath,
  handleFolderClick,
  folders,
  files,
  paginated,
  handlePagination,
  previewAll,

  browserType,
  username,
}: BrowserInterface) {
  return (
    <Grid
      style={{
        marginLeft: '0.5em',
      }}
      hasGutter
    >
      {files &&
        files.length > 0 &&
        files.map((file) => {
          return (
            <GridItem key={file.data.fname} sm={12} lg={2}>
              <FileCard
                previewAll={previewAll}
                file={file}
                initialPath={initialPath}
                browserType={browserType}
              />
            </GridItem>
          )
        })}
      {files &&
        files.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath, 'file')
                  }}
                  variant="link"
                >
                  Read more files
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}

      {folders &&
        folders.length > 0 &&
        folders.map((folder, index) => {
          return (
            <GridItem key={`${folder}_${index}`} sm={12} lg={2}>
              <FolderCard
                browserType={browserType}
                initialPath={initialPath}
                handleFolderClick={handleFolderClick}
                key={index}
                folder={folder}
                username={username}
              />
            </GridItem>
          )
        })}

      {folders &&
        folders.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath, 'folder')
                  }}
                  variant="link"
                >
                  Read more Folders
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}
    </Grid>
  )
}

const TooltipParent = ({ children }: { children: React.ReactElement }) => {
  const { state, dispatch } = useContext(LibraryContext)

  const hideToolTip = () => {
    dispatch({
      type: Types.SET_TOOLTIP,
      payload: {
        tooltip: true,
      },
    })
  }

  const title = (
    <div>
      Double Click: enter; Long Press: select; Dismiss Tooltip:{' '}
      <span onClick={hideToolTip} style={{ textAlign: 'center' }}>
        <MdClose />
      </span>
    </div>
  )

  return (
    <Tooltip visible={state.tooltip ? false : undefined} title={title}>
      {children}
    </Tooltip>
  )
}

function FileCard({
  file,
  previewAll,
  initialPath,
  browserType,
}: {
  file: any
  previewAll: boolean
  browserType: string
  initialPath: string
}) {
  const { handlers } = useLongPress()
  const { state } = useContext(LibraryContext)
  const { selectedFolder } = state

  const { handleOnClick, handleOnMouseDown } = handlers
  const fileNameArray = file.data.fname.split('/')
  const fileName = fileNameArray[fileNameArray.length - 1]
  const [largePreview, setLargePreview] = React.useState(false)
  const path = `${initialPath}/${fileName}`
  const background = selectedFolder.some((fileSelect) => {
    return fileSelect.folder === file
  })

  return (
    <>
      <TooltipParent>
        <Card
          style={{
            background: `${background ? '#e7f1fa' : 'white'}`,
          }}
          onClick={(e) => {
            handleOnClick(e, path, file, initialPath, browserType)
          }}
          onMouseDown={handleOnMouseDown}
          key={file.data.fname}
          isRounded
          isHoverable
          isSelectable
        >
          <CardBody>
            {previewAll && (
              <div
                style={{
                  margin: '-1.15em -1.15em 1em -1.15em',
                  maxHeight: '10em',
                  overflow: 'hidden',
                }}
              >
                <FileDetailView selectedFile={file} preview="small" />
              </div>
            )}

            <div
              style={{
                overflow: 'hidden',
              }}
            >
              <Button icon={<FaFile />} variant="link" style={{ padding: '0' }}>
                <b>{elipses(fileName, 20)}</b>
              </Button>
            </div>
            <div>
              <span>{(file.data.fsize / (1024 * 1024)).toFixed(3)} MB</span>
              <Button
                onClick={async () => {
                  const blob = await file.getFileBlob()
                  FileViewerModel.downloadFile(blob, fileName)
                }}
                variant="link"
                icon={<FaDownload />}
              />

              <Button
                variant="link"
                onClick={() => {
                  setLargePreview(true)
                }}
                icon={<FaExpand />}
              />
            </div>
          </CardBody>
          {largePreview && (
            <Modal
              title="Preview"
              aria-label="viewer"
              width={'50%'}
              isOpen={largePreview}
              onClose={() => setLargePreview(false)}
            >
              <FileDetailView selectedFile={file} preview="large" />
            </Modal>
          )}
        </Card>
      </TooltipParent>
    </>
  )
}

interface FolderCardInterface {
  browserType: string
  initialPath: string
  folder: string
  handleFolderClick: (path: string, prevPath: string) => void
  username?: string | null
}

function FolderCard({
  browserType,
  initialPath,
  folder,
  handleFolderClick,
  username,
}: FolderCardInterface) {
  const { handlers } = useLongPress()
  const { state } = useContext(LibraryContext)
  const { selectedFolder } = state

  const [feedName, setFeedName] = useState('')
  const [commitDate, setCommitDate] = useState('')
  const path = `${initialPath}/${folder}`

  const { handleOnClick, handleOnMouseDown } = handlers

  React.useEffect(() => {
    async function fetchFeedName() {
      if (browserType === 'feed' && initialPath === username) {
        const client = ChrisAPIClient.getClient()
        const id = folder.split('_')[1]
        const feed = await client.getFeed(parseInt(id))
        setFeedName(feed.data.name)
        setCommitDate(feed.data.creation_date)
      }
    }
    fetchFeedName()
  }, [browserType, folder, initialPath, username])

  const background = selectedFolder.some((file) => {
    return file.folder === folder
  })

  return (
    <TooltipParent>
      <Card
        onClick={(e) => {
          handleOnClick(
            e,
            path,
            folder,
            initialPath,
            browserType,
            handleFolderClick,
          )
        }}
        onMouseDown={handleOnMouseDown}
        isHoverable
        isSelectable
        isRounded
        style={{
          background: `${background ? '#e7f1fa' : 'white'}`,
        }}
      >
        <CardHeader>
          <Split style={{ overflow: 'hidden' }}>
            <SplitItem style={{ marginRight: '1em' }}>
              <FaFolder />
            </SplitItem>
            <SplitItem isFilled>
              <Button style={{ padding: 0 }} variant="link">
                <b>
                  {browserType === 'feed' && initialPath === username ? (
                    !feedName ? (
                      <Spin />
                    ) : (
                      elipses(feedName, 36)
                    )
                  ) : (
                    elipses(folder, 36)
                  )}
                </b>
              </Button>
              <div>{commitDate ? new Date(commitDate).toDateString() : ''}</div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </TooltipParent>
  )
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len - 3) + '...'
}
